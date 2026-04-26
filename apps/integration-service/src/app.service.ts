import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DB_PROVIDER } from './db/db.provider';
import { QUEUE_PROVIDER } from './queue/queue.provider';
import {
  integrations,
  channelAccounts,
  messages,
  customers,
  users,
} from '@repo/db';
import { count, desc, eq } from 'drizzle-orm';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject(DB_PROVIDER) private db: any,
    @Inject(QUEUE_PROVIDER) private queue: any,
  ) {}

  async onModuleInit() {
    await this.startConsumer();
  }

  async getAllIntegrations() {
    try {
      const integrationDb = await this.db.select().from(integrations);
      if (!integrationDb) {
        throw new Error('Not found');
      }

      return { success: true, data: integrationDb };
    } catch (error) {
      console.error(error);
      return { success: false, message: `failed ${error}` };
    }
  }

  async getChannelAccountByIntegrationId(integrationId: string) {
    try {
      const chanelAccountDb = await this.db
        .select()
        .from(channelAccounts)
        .where(eq(channelAccounts.integrationId, integrationId));

      if (!chanelAccountDb) {
        throw new Error('Not found');
      }

      return { success: true, data: chanelAccountDb };
    } catch (error) {
      console.error(error);
      return { success: false, message: `failed ${error}` };
    }
  }

  async handleSendTelegram(data: any) {
    const { botToken, chatId, message } = data;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const results = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });

    console.log(await results.json());
  }

  async handleSendDiscord(data: any) {
    const { botToken, chatId, message } = data;
    const url = `https://discord.com/api/v10/channels/${chatId}/messages`;
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message }),
    });

    console.log(await result.json());
  }

  async startConsumer() {
    const channel = this.queue.channel;
    const exchange = 'chat_exchange';

    await channel.assertExchange(exchange, 'topic', { durable: true });

    const q = await channel.assertQueue('integration_queue', {
      durable: true,
    });

    await channel.bindQueue(q.queue, exchange, 'message.reply');

    channel.consume(q.queue, async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());
        console.log('Integration received:', payload);

        if (payload.platform === 'telegram') {
          await this.handleSendTelegram(payload);
        } else if (payload.platform === 'discord') {
          await this.handleSendDiscord(payload);
        }

        channel.ack(msg);
      } catch (error) {
        console.error('Integration error:', error);
        channel.nack(msg);
      }
    });
  }

  private getRoutingKey(type: string) {
    if (type === 'text') return 'message.text';
    if (type === 'file') return 'message.file';
    if (type === 'image') return 'message.image';
    if (type === 'video') return 'message.video';
    return 'message.text';
  }

  async pushMessageToQueue(message: any) {
    try {
      const exchange = 'chat_exchange';
      const routingKey = this.getRoutingKey(message.type);

      const payload = {
        ...message,
        timestamp: new Date().toISOString(),
      };

      this.queue.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true },
      );

      console.log(`Message published to queue with routing key: ${routingKey}`);
      return { success: true };
    } catch (error) {
      console.error('Error pushing message to queue:', error);
      return {
        success: false,
        error: 'Failed to push message to queue',
      };
    }
  }

  async getStatis() {
    try {
      const countMessage = (
        await this.db.select({ total: count() }).from(messages)
      )[0].total;

      const countStaff = (
        await this.db.select({ total: count() }).from(users)
      )[0].total;

      const countCustomer = (
        await this.db.select({ total: count() }).from(customers)
      )[0].total;

      const customersDb = await this.db
        .select()
        .from(customers)
        .orderBy(desc(customers.createdAt))
        .limit(4);

      const platformStats = await this.db
        .select({
          platform: channelAccounts.platform,
          total: count(),
        })
        .from(messages)
        .innerJoin(
          channelAccounts,
          eq(messages.channelAccountId, channelAccounts.id),
        )
        .groupBy(channelAccounts.platform);

      return {
        success: true,
        data: {
          countMessage,
          countCustomer,
          countStaff,
          platformStats,
          customersDb,
        },
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: `failed ${error}` };
    }
  }
}
