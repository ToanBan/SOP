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
      const { conversationId, message, participantIds } = JSON.parse(raw);

      console.log({
        conversationId, message, participantIds
      })

      for (const userId of participantIds) {
        this.gateway.server.local.to(`user:${userId}`).emit('new_message', {
          ...message,
          conversationId,
        });
      }
    });

    console.log('Socket Redis subscriber started');
  }
}
