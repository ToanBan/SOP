import { Module } from "@nestjs/common";
import { REDIS_PROVIDER } from "./redis.provider";
import { getRedis } from "@repo/redis" 

@Module({
    providers: [
        {
            provide: REDIS_PROVIDER,
            useFactory: getRedis
        }
    ],
    exports: [REDIS_PROVIDER]
})
export class RedisModule { }