import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WebhookController } from './webhook/webhook.controller';
import { DbModule } from './db/db.module';
import { TelegramController } from './telegram/telegram.controller';
import { TelegramService } from './telegram/telegram.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DbModule,
  ],
  controllers: [AppController, WebhookController, TelegramController],
  providers: [AppService, TelegramService],
})
export class AppModule {}
