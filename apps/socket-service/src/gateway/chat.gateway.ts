import { UnauthorizedException, OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { createClient } from 'redis';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server!: Server;

  async onModuleInit() {
    const subClient = createClient({ url: process.env.REDIS_URL });
    await subClient.connect();

    await subClient.subscribe('new_message', (message) => {
      const data = JSON.parse(message);
      const { conversationId, message: msg } = data;

      console.log(`[Redis] Nhận tin nhắn mới cho conversation: ${conversationId}`);

      this.server
        .to(`conversation:${conversationId}`)
        .emit('new_message', msg);
    });

    console.log('[Redis] Đã subscribe channel new_message');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;

      if (!token) {
        throw new UnauthorizedException('No token');
      }

      const res = await fetch(`${process.env.BE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await res.json();
      client.data.user = user;

      console.log(`[Gateway] Client connected: ${client.id} on PORT ${process.env.PORT}`);

      client.on('join_conversation', (conversationId: string) => {
        client.join(`conversation:${conversationId}`);
        console.log(`[Gateway] Client ${client.id} joined conversation:${conversationId}`);
      });
    } catch (err) {
      console.error('[Gateway] Socket auth error:', err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[Gateway] Client disconnected: ${client.id}`);
  }
}