import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { AppService } from 'src/app.service';
import { DB_PROVIDER } from 'src/db/db.provider';
import { channelAccounts, eq} from '@repo/db';


@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly appService: AppService,
    @Inject(DB_PROVIDER) private readonly db: any,
  ) {}

  private normalizeTelegramMessage(channelId: string, message: any, accessToken:string) {
    const hasText = message.text;
    const hasDocument = message.document;

    let type = 'text';
    let mediaUrl = null;

    if (hasDocument) {
      type = 'media';
      mediaUrl = message.document.file_id;
    }

    console.log(type);

    return {
      channelId,
      platform: 'telegram',
      conversationExternalId: message.chat.id.toString(),
      customerExternalId: message.from.id.toString(),
      messageExternalId: message.message_id.toString(),
      type,
      text: message.text || null,
      mediaUrl,
      accessToken,
      raw: message,
    };
  }

  @Post('telegram/:channelId')
  async handleTelegramWebhook(
    @Body() body: any,
    @Param('channelId') channelId: string,
  ) {
    try {
      const message = body.message;

      const channelAccount = await this.db
        .select({ accessToken: channelAccounts.accessToken })
        .from(channelAccounts)
        .where(eq(channelAccounts.id, channelId))

      const accessToken = channelAccount[0].accessToken;
      if (!message) return { ok: true };
      const normalized = this.normalizeTelegramMessage(channelId, message, accessToken);
      await this.appService.pushMessageToQueue(normalized);
      return { success: true };
    } catch (error) {
      console.error('Error handling Telegram webhook:', error);
      return { success: false, message: 'Failed to handle Telegram webhook' };
    }
  }
}
