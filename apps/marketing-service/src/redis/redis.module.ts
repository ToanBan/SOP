import { Module } from '@nestjs/common';
import { getRedis } from '@repo/redis';
import { REDIS_PROVIDER } from './redis.provider';
@Module({
  providers: [
    {
      provide: REDIS_PROVIDER,
      useFactory: getRedis,
    },
  ],
  exports: [REDIS_PROVIDER],
})
export class RedisModule { }
