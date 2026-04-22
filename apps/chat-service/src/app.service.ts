import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DB_PROVIDER } from './db/db.provide';
import { QUEUE_PROVIDER } from './queue/queue.provider';
import {
  customers,
  customerIdentities,
  conversations,
  conversationParticipants,
  messages,
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
    const q = await channel.assertQueue('chat_queue', { durable: true });
    await channel.bindQueue(q.queue, exchange, 'message.*');

    channel.consume(q.queue, async (msg) => {
      if (!msg) return;

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
                'Telegram User',
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

            // Tạo Participant
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

          // 3. Kiểm tra trùng tin nhắn và Lưu tin nhắn mới
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
              `✅ [SUCCESS] Saved message: ${payload.messageExternalId}`,
            );
          }
        });

        channel.ack(msg);
      } catch (error) {
        console.error('❌ [ERROR] Consumer Transaction:');
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
}
