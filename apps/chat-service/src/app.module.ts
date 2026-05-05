import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';
import { ChatGateway } from './gateway/chat.gateway';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DbModule,
    QueueModule,
    RedisModule
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
