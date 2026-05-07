import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DB_PROVIDER } from './db/db.provider';
import { QUEUE_PROVIDER } from './queue/queue.provider';
import { channelAccounts, messages, customers, users } from '@repo/db';
import { count, desc, eq } from '@repo/db';
import { REDIS_PROVIDER } from './redis/redis.provider';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject(DB_PROVIDER) private db: any,
    @Inject(QUEUE_PROVIDER) private queue: any,
    @Inject(REDIS_PROVIDER) private redis: any,
  ) {}

  async onModuleInit() {
    await this.startConsumer();
  }

  async downloadFile(mediaUrl: string) {
    const response = await fetch(mediaUrl);
    const blob = await response.blob();
    const fileName = mediaUrl.split('/').pop() || 'file';
    const contentType = blob.type || 'application/octet-stream';
    return { blob, fileName, contentType };
  }

  async handleSendTelegram(data: any) {
    const { botToken, chatId, message, mediaUrl } = data;
    console.log('nhắn lại từ telegram');
    if (mediaUrl) {
      const { blob, fileName, contentType } = await this.downloadFile(mediaUrl);

      const formData = new FormData();
      formData.append('chat_id', String(chatId));
      formData.append('caption', message || '');

      const isImage = contentType.startsWith('image/');
      if (isImage) {
        formData.append('photo', blob, fileName);
        await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          body: formData,
        });
      } else {
        formData.append('document', blob, fileName);
        await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
          method: 'POST',
          body: formData,
        });
      }
    } else {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message }),
      });
    }
  }

  async handleSendDiscord(data: any) {
    const { botToken, chatId, message, mediaUrl } = data;
    const url = `https://discord.com/api/v10/channels/${chatId}/messages`;

    if (mediaUrl) {
      const { blob, fileName } = await this.downloadFile(mediaUrl);

      const formData = new FormData();
      formData.append(
        'payload_json',
        JSON.stringify({ content: message || '' }),
      );
      formData.append('files[0]', blob, fileName);

      const result = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bot ${botToken}` },
        body: formData,
      });
      console.log(await result.json());
    } else {
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
  }

  async handleSendFacebook(data: any) {
    const { botToken, chatId, message, mediaUrl } = data;
    const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${botToken}`;
    console.log('nhắn lại từ facebook');

    if (mediaUrl) {
      const { blob, fileName, contentType } = await this.downloadFile(mediaUrl);

      const formData = new FormData();
      formData.append('recipient', JSON.stringify({ id: chatId }));

      const isImage = contentType.startsWith('image/');
      formData.append(
        'message',
        JSON.stringify({
          attachment: {
            type: isImage ? 'image' : 'file',
            payload: { is_reusable: true },
          },
        }),
      );
      formData.append('filedata', blob, fileName);

      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log(data);
    } else {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: chatId },
          message: { text: message },
        }),
      });

      const data = await res.json();
      console.log(data);
    }
  }

  async startConsumer() {
    const channel = this.queue.channel;
    const exchange = 'chat_exchange';
    await channel.assertExchange(exchange, 'topic', { durable: true });

    const q = await channel.assertQueue('integration_queue', {
      durable: true,
    });

    await channel.bindQueue(q.queue, exchange, 'message.reply');
    await channel.bindQueue(q.queue, exchange, 'message.campaign');
    channel.consume(q.queue, async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());

        if (payload.platform === 'telegram') {
          await this.handleSendTelegram(payload);
        } else if (payload.platform === 'discord') {
          await this.handleSendDiscord(payload);
        } else if (payload.platform === 'facebook') {
          await this.handleSendFacebook(payload);
        }

        channel.ack(msg);
      } catch (error) {
        console.error('Integration error:', error);
        channel.nack(msg, false, false);
      }
    });
  }

  async pushMessageToQueue(message: any) {
    try {
      const exchange = 'chat_exchange';
      const routingKey = `message.${message.type}`;

      const payload = {
        ...message,
        timestamp: new Date().toISOString(),
      };

      console.log("djadjksald", routingKey);

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
    const cached = await this.redis.get('statis:all');
    try {
      if (cached) {
        return { success: true, data: JSON.parse(cached) };
      }
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

      const data = {
        countMessage,
        countCustomer,
        countStaff,
        platformStats,
        customersDb,
      };
      await this.redis.set('statis:all', JSON.stringify(data), 'EX', 60);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: `failed ${error}` };
    }
  }
}
