import { UnauthorizedException, OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      console.log(`[Replica PORT:${process.env.PORT}] Client connected: ${client.id}`);
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

      console.log(
        `[Gateway] Client connected: ${client.id} on PORT ${process.env.PORT}`,
      );
    } catch (err) {
      console.error('[Gateway] Socket auth error:', err);
      client.disconnect();
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(client: Socket, conversationId: string) {
    client.join(`conversation:${conversationId}`);
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(client: Socket, conversationId: string) {
    client.leave(`conversation:${conversationId}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Gateway] Client disconnected: ${client.id}`);
  }
}
