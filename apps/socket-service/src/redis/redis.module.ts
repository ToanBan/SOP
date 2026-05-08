import { Module } from '@nestjs/common';
import { getRedis, getRedisPublisher, getRedisSubscriber } from '@repo/redis';
import { REDIS_PROVIDER } from './redis.provider';
import { REDIS_SUB } from './redisSub.provider';
import { REDIS_PUB } from './redisPub.provider';
@Module({
  providers: [
    {
      provide: REDIS_PROVIDER,
      useFactory: getRedis,
    },

    {
      provide: REDIS_PUB,
      useFactory: getRedisPublisher,
    },
    {
      provide: REDIS_SUB,
      useFactory: getRedisSubscriber,
    },
  ],
  exports: [REDIS_PROVIDER, REDIS_SUB],
})
export class RedisModule {}
