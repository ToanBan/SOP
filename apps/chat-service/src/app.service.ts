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
} from '@repo/db';
import { eq, and, desc, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject(DB_PROVIDER) private readonly db: any,
    @Inject(QUEUE_PROVIDER) private readonly queue: any,
  ) {}

  async onModuleInit() {
    await this.startConsumer();
  }

  async startConsumer() {
    const channel = this.queue.channel;
    const exchange = 'chat_exchange';

    await channel.assertExchange(exchange, 'topic', { durable: true });
    const q = await channel.assertQueue('chat_queue_v2', { durable: true });
    await channel.bindQueue(q.queue, exchange, 'message.text');

    channel.consume(q.queue, async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());
        const { raw } = payload;
        console.log('rawwwwwww', raw);
        console.log('payloadddddđ', payload);

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
                'Discord User',
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

          const messageResults = await tx
            .select()
            .from(messages)
            .where(eq(messages.externalMessageId, payload.messageExternalId))
            .limit(1);

          if (messageResults.length === 0) {
            await tx.insert(messages).values({
              id: uuidv4(),
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
            console.log(
              `[SUCCESS] Saved message: ${payload.messageExternalId}`,
            );
          }
        });

        channel.ack(msg);
      } catch (error) {
        console.error('[ERROR] Consumer Transaction:', error);
      }
    });
  }

  async getCustomers() {
    try {
      const customersList = await this.db
        .select({
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
        .orderBy(desc(customers.lastSeenAt));

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
        })
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));

      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: 'Failed to get messages' };
    }
  }

  async getConversationsByCustomerId(
    customerId: string,
    channelAccountId: string,
  ) {
    try {
      const messagesList = await this.db
        .select({
          id: messages.id,
          content: messages.content,
          type: messages.type,
          mediaUrl: messages.mediaUrl,
          createdAt: messages.createdAt,
          conversationId: messages.conversationId,
        })
        .from(messages)
        .innerJoin(conversations, eq(messages.conversationId, conversations.id))
        .where(
          and(
            eq(messages.customerId, customerId),
            eq(messages.channelAccountId, channelAccountId),
          ),
        )
        .orderBy(asc(messages.createdAt));
      return { success: true, data: messagesList };
    } catch (error) {
      console.error('Get Conversations Error:', error);
      return { success: false, message: 'Failed to get conversations' };
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
    file: File | null,
  ) {
    try {
      const messageId = uuidv4();
      await this.db.insert(messages).values({
        id: messageId,
        channelAccountId,
        conversationId,
        senderType: 'agent',
        senderId: 'agent',
        type: file ? 'file' : 'text',
        content: message,
        mediaUrl: file ? `https://fakeurl.com/${file.name}` : null,
        externalMessageId: messageId,
        metadata: JSON.stringify({ sentFrom: 'web' }),
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
            file: file ? { name: file.name, type: file.type } : null,
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
}
