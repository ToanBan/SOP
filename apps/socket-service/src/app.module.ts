import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ChatGateway } from './gateway/chat.gateway';
import { RedisModule } from './redis/redis.module';
import { MessageSubscriberService } from './gateway/message_subcriber';
import { Notification } from './gateway/notification';
import { DbModule } from './db/db.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule, 
    DbModule
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway, MessageSubscriberService, Notification],
})
export class AppModule {}
