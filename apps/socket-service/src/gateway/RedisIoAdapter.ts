
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  async connectToRedis(): Promise<void> {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      console.log('RedisIoAdapter Connected to Redis successfully');
    } catch (error) {
      console.error('RedisIoAdapter Failed to connect to Redis:', error);
      throw error;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
      console.log('RedisIoAdapter Redis adapter attached to Socket.io');
    } else {
      console.warn('RedisIoAdapter Warning: Redis adapter not initialized, using default adapter');
    }
  
    return server;
  }
}
