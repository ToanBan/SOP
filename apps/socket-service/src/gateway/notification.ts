import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import { REDIS_PROVIDER } from 'src/redis/redis.provider';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class Notification implements OnModuleInit {
  constructor(
    @Inject(REDIS_PROVIDER) private readonly redis: any,
    private readonly gateway: ChatGateway,
  ) {}

  async onModuleInit() {
    const subClient = createClient({ url: process.env.REDIS_URL });
    await subClient.connect();

    await subClient.subscribe('new_notification', async (raw) => {
      const { notificationId, type, data, participantIds } = JSON.parse(raw);

      for (const userId of participantIds) {
        const sockets = await this.gateway.server
          .in(`user:${userId}`)
          .fetchSockets();

        for (const socket of sockets) {
          this.gateway.server.local.to(socket.id).emit('new_notification', {
            notificationId,
            type,
            data,
          });

          console.log(`Socket Notification Emit user=${userId} socket=${socket.id}`);
        }
      }
    });

    console.log('Socket Redis subscriber started');
  }
}