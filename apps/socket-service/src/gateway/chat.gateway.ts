import { UnauthorizedException, OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
      if (!token) throw new UnauthorizedException('No token');

      const res = await fetch(`${process.env.BE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) throw new UnauthorizedException('Invalid token');

      const user = await res.json();

      console.log(user);
      client.data.user = user;
      await client.join(`user:${user.sub}`);

      console.log(
        `Gateway Client connected: ${client.id} on PORT ${process.env.PORT}`,
      );
    } catch (err) {
      console.error('Gateway Socket auth error:', err);
      client.disconnect();
    }
  }


  handleDisconnect(client: Socket) {
    console.log(`[Gateway] Client disconnected: ${client.id}`);
  }
}
