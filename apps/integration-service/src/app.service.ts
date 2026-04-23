import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DB_PROVIDER } from './db/db.provider';
import { QUEUE_PROVIDER } from './queue/queue.provider';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject(DB_PROVIDER) private db: any,
    @Inject(QUEUE_PROVIDER) private queue: any,
  ) {}

  async onModuleInit() {
    await this.startConsumer();
  }

  async handleSendTelegram(data: any) {
    const { botToken, chatId, message } = data;
    console.log('FULL DATA:', JSON.stringify(data, null, 2));

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const results = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ chat_id:chatId, text: message }),
    });

    console.log(await results.json());
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

        await this.handleSendTelegram(payload);

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
}
