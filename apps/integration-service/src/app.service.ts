import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DB_PROVIDER } from './db/db.provider';
import { QUEUE_PROVIDER } from './queue/queue.provider';
import {
  channelAccounts,
  messages,
  customers,
  users,
  campaigns,
} from '@repo/db';
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
    try {
      const { botToken, chatId, message, mediaUrls } = data;

      if (mediaUrls?.length) {
        for (const mediaUrl of mediaUrls) {
          const { blob, fileName, contentType } =
            await this.downloadFile(mediaUrl);
          const formData = new FormData();
          formData.append('chat_id', String(chatId));
          formData.append('caption', message || '');

          const isImage = contentType?.startsWith('image/');
          if (isImage) {
            formData.append('photo', blob, fileName);
            await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
              method: 'POST',
              body: formData,
            });
          } else {
            formData.append('document', blob, fileName);
            await fetch(
              `https://api.telegram.org/bot${botToken}/sendDocument`,
              {
                method: 'POST',
                body: formData,
              },
            );
          }
        }
      } else {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: message }),
        });
      }
    } catch (error) {
      return { success: false, message: `Failed ${error}` };
    }
  }

  async handleSendDiscord(data: any) {
    try {
      const { botToken, chatId, message, mediaUrls } = data;
      const url = `https://discord.com/api/v10/channels/${chatId}/messages`;

      if (mediaUrls?.length) {
        const formData = new FormData();
        formData.append(
          'payload_json',
          JSON.stringify({ content: message || '' }),
        );

        for (let i = 0; i < mediaUrls.length; i++) {
          const { blob, fileName } = await this.downloadFile(mediaUrls[i]);
          formData.append(`files[${i}]`, blob, fileName);
        }

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
    } catch (error) {
      return { success: false, message: `Failed ${error}` };
    }
  }

  async handleSendFacebook(data: any) {
    try {
      const { botToken, chatId, message, mediaUrls } = data;
      const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${botToken}`;
      console.log('nhắn lại từ facebook');

      if (mediaUrls?.length) {
        for (const mediaUrl of mediaUrls) {
          const { blob, fileName, contentType } =
            await this.downloadFile(mediaUrl);
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

          const res = await fetch(url, { method: 'POST', body: formData });
          console.log(await res.json());
        }
      } else {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { id: chatId },
            message: { text: message },
          }),
        });
        console.log(await res.json());
      }
    } catch (error) {
      return { success: false, message: `Failed ${error}` };
    }
  }

  async handleFacebookFeed(payload: any) {
    try {
      const { pageId, botToken, message, mediaUrls, campaignId, channelAccountId} = payload;

      if (!mediaUrls || mediaUrls.length === 0) {
        const response = await fetch(
          `https://graph.facebook.com/v19.0/${pageId}/feed`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message,
              access_token: botToken,
            }),
          },
        );
        const data = await response.json();
        if (!response.ok) throw new Error(JSON.stringify(data));
        console.log('Facebook feed created:', data);
        if (campaignId && data.id) {
          await this.db
            .update(campaigns)
            .set({
              externalPostId: data.id,
              channelAccountId
            })
            .where(eq(campaigns.id, campaignId));
        }
        return;
      }

      for (const mediaUrl of mediaUrls) {
        const { blob, fileName, contentType } =
          await this.downloadFile(mediaUrl);
        const isImage = contentType.startsWith('image/');
        const isVideo = contentType.startsWith('video/');

        if (isImage) {
          const formData = new FormData();
          formData.append('source', blob, fileName);
          formData.append('caption', message);
          formData.append('access_token', botToken);

          const response = await fetch(
            `https://graph.facebook.com/v19.0/${pageId}/photos`,
            { method: 'POST', body: formData },
          );
          const data = await response.json();
          if (!response.ok) throw new Error(JSON.stringify(data));
          if (campaignId && data.id) {
            await this.db
              .update(campaigns)
              .set({
                externalPostId: data.post_id,
                channelAccountId
              })
              .where(eq(campaigns.id, campaignId));
          }
        } else if (isVideo) {
          const formData = new FormData();
          formData.append('source', blob, fileName);
          formData.append('description', message);
          formData.append('access_token', botToken);

          const response = await fetch(
            `https://graph.facebook.com/v19.0/${pageId}/videos`,
            { method: 'POST', body: formData },
          );
          const data = await response.json();
          if (!response.ok) throw new Error(JSON.stringify(data));
          if (campaignId && data.id) {
            await this.db
              .update(campaigns)
              .set({
                externalPostId: data.post_id,
                channelAccountId
              })
              .where(eq(campaigns.id, campaignId));
          }
        }
      }
    } catch (error) {
      return { success: false, message: `Failed ${error}` };
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
          if (payload.type === 'feed') {
            console.log('check tại đây');

            await this.handleFacebookFeed(payload);
          } else {
            await this.handleSendFacebook(payload);
          }
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
        error: `Failed to push message to queue ${error}`,
      };
    }
  }

  async pushReactionToQueue(reaction: any) {
    try {
      const exchange = 'chat_exchange';
      const routingKey = 'facebook.feed.reaction';

      const payload = {
        ...reaction,
        timestamp: new Date().toISOString(),
      };

      this.queue.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true },
      );

      console.log(
        `Reaction published to queue with routing key: ${routingKey}`,
      );
      return { success: true };
    } catch (error) {
      console.error('Error pushing reaction to queue:', error);
      return {
        success: false,
        error: `Failed to push reaction to queue ${error}`,
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
