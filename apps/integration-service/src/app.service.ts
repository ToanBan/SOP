import { Inject, Injectable } from '@nestjs/common';
import { DB_PROVIDER } from './db/db.provider';
import { QUEUE_PROVIDER } from './queue/queue.provider';

@Injectable()
export class AppService {
  constructor(
    @Inject(DB_PROVIDER) private db: any,
    @Inject(QUEUE_PROVIDER) private queue: any,
  ) {}

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
