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
  messageAttachments,
  inArray,
} from '@repo/db';

import { v4 as uuidv4 } from 'uuid';
import { REDIS_PROVIDER } from './redis/redis.provider';
import { REDIS_PUB } from './redis/redisPub.provider';
@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject(DB_PROVIDER) private readonly db: any,
    @Inject(QUEUE_PROVIDER) private readonly queue: any,
    @Inject(REDIS_PROVIDER) private readonly redis: any,
    @Inject(REDIS_PUB) private readonly pub: any,
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

      try {
        const payload = JSON.parse(msg.content.toString());
        const { raw, platform } = payload;

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
            const customerName =
              platform === 'telegram'
                ? `${raw?.from?.first_name || ''} ${raw?.from?.last_name || ''}` ||
                  raw?.from?.username ||
                  'Unknown'
                : platform === 'facebook'
                  ? `Facebook User ${raw?.sender?.id || ''}`
                  : platform === 'discord'
                    ? `${raw.author.username}`
                    : 'Unknown';
            await tx.insert(customers).values({
              id: currentCustomerId,
              name: customerName,
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
            externalMessageId: payload.messageExternalId,
            metadata: JSON.stringify(raw),
          });

          if (payload.mediaUrls?.length) {
            await tx.insert(messageAttachments).values(
              payload.mediaUrls.map((url: string) => ({
                id: uuidv4(),
                messageId: newMessageId,
                url,
                type: payload.type,
              })),
            );
          }

          await this.pub.publish(
            'new_message',
            JSON.stringify({
              conversationId: currentConversationId,
              message: {
                id: newMessageId,
                content: payload.text,
                mediaUrls: payload.mediaUrls || [],
                senderType: 'customer',
                createdAt: new Date(),
              },
            }),
          );

          await this.redis.del('allcustomer:all');
          await this.redis.del('customers:all');
        });

        channel.ack(msg);
      } catch (error) {
        console.error('ERROR Consumer Transaction:', error);
        channel.nack(msg, false, false);
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
      return { success: false, message: `Failed ${error}` };
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
      return { success: false, message: `Failed ${error}`  };
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
        })
        .from(messages)
        .leftJoin(customers, eq(messages.customerId, customers.id))
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));

      const messageIds = result.map((m: any) => m.id);
      const attachments = messageIds.length
        ? await this.db
            .select()
            .from(messageAttachments)
            .where(inArray(messageAttachments.messageId, messageIds))
        : [];

      const data = result.map((m: any) => ({
        ...m,
        mediaUrls: attachments
          .filter((a: any) => a.messageId === m.id)
          .map((a: any) => a.url),
      }));

      return { success: true, data };
    } catch (error) {
      return { success: false, message: `Failed ${error}` };
    }
  }

  async updateCustomer(
    customerId: string,
    email?: string,
    phone?: string,
    name?: string,
  ) {
    try {
      const results = await this.db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      const existingCustomer = results[0];

      if (!existingCustomer) {
        return { success: false, message: 'Not found Customer' };
      }
      const dataToUpdate = {};
      if (email) {
        dataToUpdate['email'] = email;
      }
      if (phone) {
        dataToUpdate['phone'] = phone;
      }

      if (name) {
        dataToUpdate['name'] = name;
      }

      if (Object.keys(dataToUpdate).length === 0) {
        return { success: true, message: 'nothing something to update' };
      }
      await this.db
        .update(customers)
        .set(dataToUpdate)
        .where(eq(customers.id, customerId));

      await this.redis.del('customers:all');
      return { success: true, message: 'Update successfully' };
    } catch (error) {
      console.error('Update Customer Error:', error);
      return { success: false, message: `Failed ${error}` };
    }
  }

  async replyToCustomer(
    conversationId: string,
    message: string,
    channelAccountId: string,
    files: any[],
  ) {
    try {
      let mediaUrls: string[] = [];

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append(
            'files',
            new Blob([file.buffer], { type: file.mimetype }),
            file.originalname,
          );
        });

        const res = await fetch(`${process.env.BE_URL}/media/upload`, {
          method: 'POST',
          body: formData,
          headers: { 'x-internal-key': `${process.env.INTERNAL_KEY}` },
        });

        console.log(process.env.INTERNAL_KEY);
        console.log(process.env.BE_URL)

        mediaUrls = await res.json();
        console.log(mediaUrls);
      }

      const messageId = uuidv4();
      await this.db.insert(messages).values({
        id: messageId,
        channelAccountId,
        conversationId,
        senderType: 'agent',
        senderId: 'agent',
        type: files.length > 0 ? 'media' : 'text',
        content: message,
        externalMessageId: messageId,
        metadata: JSON.stringify({ sentFrom: 'web' }),
      });

      if (mediaUrls.length > 0) {
        await this.db.insert(messageAttachments).values(
          mediaUrls.map((url) => ({
            id: uuidv4(),
            messageId,
            url,
            type: 'file',
          })),
        );
      }

      await this.pub.publish(
        'new_message',
        JSON.stringify({
          conversationId,
          message: {
            id: messageId,
            content: message,
            mediaUrls,
            senderType: 'agent',
            createdAt: new Date(),
          },
        }),
      );

      const conversation = await this.db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

      if (!conversation[0]) throw new Error('Conversation not found');

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
            mediaUrls, 
            senderId: 'agent',
          }),
        ),
        { persistent: true },
      );

      return { success: true, message: 'Reply sent successfully' };
    } catch (error) {
      console.error('Reply to Customer Error:', error);
      return { success: false, message: `Failed ${error}` };
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
