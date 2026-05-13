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

     
      for (const userId of participantIds) {
        const sockets = await this.gateway.server
          .in(`user:${userId}`)
          .fetchSockets();

          console.log("all", sockets);

        for (const socket of sockets) {
          this.gateway.server.local.to(socket.id).emit('new_message', {
            ...message,
            conversationId,
          });

          console.log(`Socket Emit user=${userId} socket=${socket.id}`);
        }
      }
    });

    console.log('Socket Redis subscriber started');
  }
}
