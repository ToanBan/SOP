import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { createClient } from 'redis';
import { REDIS_PROVIDER } from 'src/redis/redis.provider';

@Injectable()
export class MessageSubscriberService implements OnModuleInit {
  constructor(
    private readonly gateway: ChatGateway,
    @Inject(REDIS_PROVIDER) private readonly redis: any,
  ) {}

  async onModuleInit() {
    const subClient = createClient({ url: process.env.REDIS_URL });
    await subClient.connect();

    await subClient.subscribe('new_message', async (raw) => {
      const { conversationId, message } = JSON.parse(raw);

      const socketsInRoom = await this.gateway.server
        .in(`conversation:${conversationId}`)
        .local
        .fetchSockets();

      if (socketsInRoom.length > 0) {
        this.gateway.server
          .to(`conversation:${conversationId}`)
          .emit('new_message', message);
      }
    });

    console.log('Socket Redis subscriber started');
  }
}
