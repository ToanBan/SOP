import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DB_PROVIDER } from './db/db.provide';
import { QUEUE_PROVIDER } from './queue/queue.provider';
import {
  customers,
  customerIdentities,
  conversations,
  conversationParticipants,
  messages,
  channelAccounts,
  eq,
  and,
  desc,
  asc,
} from '@repo/db';

import { v4 as uuidv4 } from 'uuid';
import { REDIS_PROVIDER } from './redis/redis.provider';
import { ChatGateway } from './gateway/chat.gateway';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject(DB_PROVIDER) private readonly db: any,
    @Inject(QUEUE_PROVIDER) private readonly queue: any,
    @Inject(REDIS_PROVIDER) private readonly redis: any,
    private readonly chatGateway: ChatGateway,
  ) {}

  async onModuleInit() {
    await this.startConsumer();
  }

  async startConsumer() {
    const channel = this.queue.channel;
    const exchange = 'chat_exchange';

    await channel.assertExchange(exchange, 'topic', { durable: true });
    const q = await channel.assertQueue('chat_queue_v3', { durable: true });
    await channel.bindQueue(q.queue, exchange, 'message.text');
    await channel.bindQueue(q.queue, exchange, 'message.media.processed');

    channel.consume(q.queue, async (msg) => {
      if (!msg) return;

      const start = Date.now();
      try {
        const payload = JSON.parse(msg.content.toString());
        const { raw } = payload;
        await this.db.transaction(async (tx) => {
          const identityResults = await tx
            .select()
            .from(customerIdentities)
            .where(
              and(
                eq(customerIdentities.externalId, payload.customerExternalId),
                eq(customerIdentities.platform, payload.platform),
              ),
            )
            .limit(1);

          let identity = identityResults[0];
          let currentCustomerId: string;

          if (!identity) {
            currentCustomerId = uuidv4();
            await tx.insert(customers).values({
              id: currentCustomerId,
              name:
                `${raw?.from?.first_name || ''} ${raw?.from?.last_name || ''}`.trim() ||
                `${raw.author.username}`,
              lastSeenAt: new Date(),
            });

            await tx.insert(customerIdentities).values({
              id: uuidv4(),
              customerId: currentCustomerId,
              channelAccountId: payload.channelId,
              platform: payload.platform,
              externalId: payload.customerExternalId,
            });
          } else {
            currentCustomerId = identity.customerId;
            await tx
              .update(customers)
              .set({ lastSeenAt: new Date() })
              .where(eq(customers.id, currentCustomerId));
          }

          const conversationResults = await tx
            .select()
            .from(conversations)
            .where(
              eq(
                conversations.externalConversationId,
                payload.conversationExternalId,
              ),
            )
            .limit(1);

          let conversation = conversationResults[0];
          let currentConversationId: string;

          if (!conversation) {
            currentConversationId = uuidv4();
            await tx.insert(conversations).values({
              id: currentConversationId,
              channelAccountId: payload.channelId,
              conversationType: payload.conversationType,
              type: 'topic',
              externalConversationId: payload.conversationExternalId,
              title: raw?.chat?.title || raw?.from?.first_name || 'Chat',
              lastMessageAt: new Date(),
            });

            await tx.insert(conversationParticipants).values({
              id: uuidv4(),
              conversationId: currentConversationId,
              customerId: currentCustomerId,
              role: 'customer',
            });
          } else {
            currentConversationId = conversation.id;
            await tx
              .update(conversations)
              .set({ lastMessageAt: new Date() })
              .where(eq(conversations.id, currentConversationId));
          }
          const newMessageId = uuidv4();
          await tx.insert(messages).values({
            id: newMessageId,
            channelAccountId: payload.channelId,
            conversationId: currentConversationId,
            customerId: currentCustomerId,
            senderType: 'customer',
            senderId: currentCustomerId,
            type: payload.type,
            content: payload.text,
            mediaUrl: payload.mediaUrl,
            externalMessageId: payload.messageExternalId,
            metadata: JSON.stringify(raw),
          });

          this.chatGateway.sendNewMessage(currentConversationId, {
            id: newMessageId,
            content: payload.text,
            mediaUrl: payload.mediaUrl,
            senderType: 'customer',
            conversationId: currentConversationId,
            createdAt: new Date(),
          });
        });
        await this.redis.del('allcustomer:all');
        await this.redis.del('customers:all');
        const duration = Date.now() - start;
        console.log(`Processing time: ${duration}ms`);

        channel.ack(msg);
      } catch (error) {
        console.error('[ERROR] Consumer Transaction:', error);
        channel.nack(msg, false, true);
      }
    });
  }

  async getAllCustomers() {
    const cachedKey = 'allcustomer:all';
    try {
      const cached = await this.redis.get(cachedKey);
      if (cached) {
        return { success: true, data: JSON.parse(cached) };
      }
      const customer = await this.db
        .select({
          id: customers.id,
          name: customers.name,
          phone: customers.phone,
          email: customers.email,
          lastSeenAt: customers.lastSeenAt,
          createdAt: customers.createdAt,
          platform: customerIdentities.platform,
          channelAccountId: customerIdentities.channelAccountId,
        })
        .from(customers)
        .innerJoin(
          customerIdentities,
          eq(customers.id, customerIdentities.customerId),
        );

      await this.redis.set(cachedKey, JSON.stringify(customer), 'EX', 60);

      return { success: true, data: customer };
    } catch (error) {
      console.error(error);
      return { success: false, message: `Failed ${error}` };
    }
  }

  async getCustomers() {
    const cachedKey = 'customers:all';
    try {
      const cached = await this.redis.get(cachedKey);
      if (cached) {
        return { success: true, data: JSON.parse(cached) };
      }
      const customersList = await this.db
        .selectDistinct({
          id: customers.id,
          name: customers.name,
          lastSeenAt: customers.lastSeenAt,
          platform: customerIdentities.platform,
          channelAccountId: customerIdentities.channelAccountId,
          phone: customers.phone,
          email: customers.email,
        })
        .from(customers)
        .innerJoin(
          customerIdentities,
          eq(customers.id, customerIdentities.customerId),
        )
        .innerJoin(
          conversations,
          and(
            eq(
              conversations.channelAccountId,
              customerIdentities.channelAccountId,
            ),
            eq(conversations.conversationType, 'direct'),
          ),
        )
        .innerJoin(
          messages,
          and(
            eq(messages.conversationId, conversations.id),
            eq(messages.customerId, customers.id),
          ),
        )
        .orderBy(desc(customers.lastSeenAt));

      await this.redis.set(cachedKey, JSON.stringify(customersList), 'EX', 60);
      return { success: true, data: customersList };
    } catch (error) {
      console.error('Get Customers Error:', error);
      return { success: false, message: 'Failed to get customers' };
    }
  }

  async getConversationByCustomer(
    customerId: string,
    channelAccountId: string,
  ) {
    try {
      const result = await this.db
        .select({
          id: conversations.id,
          title: conversations.title,
          lastMessageAt: conversations.lastMessageAt,
        })
        .from(conversations)
        .innerJoin(
          conversationParticipants,
          eq(conversations.id, conversationParticipants.conversationId),
        )
        .where(
          and(
            eq(conversationParticipants.customerId, customerId),
            eq(conversations.channelAccountId, channelAccountId),
          ),
        )
        .orderBy(desc(conversations.lastMessageAt))
        .limit(1);

      return { success: true, data: result[0] || null };
    } catch (error) {
      return { success: false, message: 'Failed to get conversation' };
    }
  }

  async getMessagesByConversationId(conversationId: string) {
    try {
      const result = await this.db
        .select({
          id: messages.id,
          content: messages.content,
          senderType: messages.senderType,
          createdAt: messages.createdAt,
          customerName: customers.name,
          mediaUrl: messages.mediaUrl,
        })
        .from(messages)
        .leftJoin(customers, eq(messages.customerId, customers.id))
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));

      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: 'Failed to get messages' };
    }
  }

  async updateCustomer(customerId: string, email?: string, phone?: string) {
    try {
      const results = await this.db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      const existingCustomer = results[0];

      if (!existingCustomer) {
        return { success: false, message: 'Không tìm thấy khách hàng' };
      }
      const dataToUpdate = {};
      if (email) {
        dataToUpdate['email'] = email;
      }
      if (phone) {
        dataToUpdate['phone'] = phone;
      }
      if (Object.keys(dataToUpdate).length === 0) {
        return { success: true, message: 'Không có thông tin gì để cập nhật' };
      }
      await this.db
        .update(customers)
        .set(dataToUpdate)
        .where(eq(customers.id, customerId));
      return { success: true, message: 'Cập nhật thành công' };
    } catch (error) {
      console.error('Update Customer Error:', error);
      return { success: false, message: 'Lỗi hệ thống khi cập nhật' };
    }
  }

  async replyToCustomer(
    conversationId: string,
    message: string,
    channelAccountId: string,
    file: any | null,
  ) {
    try {
      let mediaUrl: string | null = null;

      if (file) {
        const formData = new FormData();
        formData.append(
          'files',
          new Blob([file.buffer], { type: file.mimetype }),
          file.originalname,
        );

        const res = await fetch(`${process.env.BE_URL}/media/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'x-internal-key': `${process.env.INTERNAL_KEY}`,
          },
        });

        const data = await res.json();

        mediaUrl = data[0];
      }

      const messageId = uuidv4();
      await this.db.insert(messages).values({
        id: messageId,
        channelAccountId,
        conversationId,
        senderType: 'agent',
        senderId: 'agent',
        type: file ? 'file' : 'text',
        content: message,
        mediaUrl,
        externalMessageId: messageId,
        metadata: JSON.stringify({ sentFrom: 'web' }),
      });

      this.chatGateway.sendNewMessage(conversationId, {
        id: messageId,
        content: message,
        mediaUrl,
        senderType: 'agent',
        conversationId,
        createdAt: new Date(),
      });

      const conversation = await this.db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

      if (!conversation[0]) {
        throw new Error('Conversation not found');
      }

      const externalConversationId = conversation[0].externalConversationId;
      const channel = await this.db
        .select()
        .from(channelAccounts)
        .where(eq(channelAccounts.id, channelAccountId))
        .limit(1);

      await this.queue.channel.publish(
        'chat_exchange',
        'message.reply',
        Buffer.from(
          JSON.stringify({
            chatId: externalConversationId,
            message,
            botToken: channel[0].accessToken,
            platform: channel[0].platform,
            mediaUrl,
            senderId: 'agent',
          }),
        ),
        { persistent: true },
      );

      return { success: true, message: 'Reply sent successfully' };
    } catch (error) {
      console.error('Reply to Customer Error:', error);
      return { success: false, message: 'Failed to reply to customer' };
    }
  }

  async getConversionGroup() {
    const cachedKey = 'conversations:channel';
    try {
      const cached = await this.redis.get(cachedKey);
      if (cached) {
        return { success: true, data: JSON.parse(cached) };
      }
      const conversationGroups = await this.db
        .select()
        .from(conversations)
        .where(eq(conversations.conversationType, 'channel'));

      await this.redis.set(
        cachedKey,
        JSON.stringify(conversationGroups),
        'EX',
        60,
      );
      return { success: true, data: conversationGroups };
    } catch (error) {
      console.error(error);
      return { success: false, message: `Failed ${error}` };
    }
  }
}
