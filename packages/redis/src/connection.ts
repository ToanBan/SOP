import Redis from 'ioredis';

let client: Redis;

export const getRedis = (): Redis => {
  if (!client) {
    client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

    client.on('connect', () => console.log('[Redis] Connected'));
    client.on('error', (err) => console.error('[Redis] Error:', err));
  }

  return client;
};