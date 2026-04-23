import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook/webhook.controller';
import { DbModule } from './db/db.module';
import { TelegramController } from './telegram/telegram.controller';
import { TelegramService } from './telegram/telegram.service';
import { QueueModule } from './queue/queue.module';
import { DiscordService } from './discord/discord.service';
import { DiscordController } from './discord/discord.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DbModule,
    QueueModule,
  ],
  controllers: [AppController, WebhookController, TelegramController, DiscordController],
  providers: [AppService, TelegramService, DiscordService],
})
export class AppModule {}
