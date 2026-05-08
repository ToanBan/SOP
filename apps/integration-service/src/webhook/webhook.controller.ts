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
import { channelAccounts, eq } from '@repo/db';
import { platform } from 'node:os';
import { url } from 'node:inspector';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly appService: AppService,
    @Inject(DB_PROVIDER) private readonly db: any,
  ) {}

  private normalizeTelegramMessage(
    channelId: string,
    message: any,
    accessToken: string,
  ) {
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
        .where(eq(channelAccounts.id, channelId));

      const accessToken = channelAccount[0].accessToken;
      if (!message) return { ok: true };
      const normalized = this.normalizeTelegramMessage(
        channelId,
        message,
        accessToken,
      );
      await this.appService.pushMessageToQueue(normalized);
      return { success: true };
    } catch (error) {
      console.error('Error handling Telegram webhook:', error);
      return { success: false, message: 'Failed to handle Telegram webhook' };
    }
  }

  @Get('facebook')
  verify(@Req() req: any) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('VERIFY HIT');

    if (mode === 'subscribe' && token === '123456') {
      return challenge;
    }

    return 'fail';
  }

  private normalizeFacebookMessage(channelId: string, event: any) {
    const message = event.message;
    const attachments = message.attachments;

    let type = 'text';
    let mediaUrl = null;

    if (attachments?.length) {
      type = 'media';
      mediaUrl = attachments[0].payload?.url ?? null;
    }

    console.log(mediaUrl);
    console.log(type);

    return {
      channelId,
      platform: 'facebook',
      conversationExternalId: event.sender.id.toString(),
      customerExternalId: event.sender.id.toString(),
      messageExternalId: message.mid.toString(),
      type,
      text: message.text || null,
      mediaUrl,
      raw: event,
    };
  }

  @Post('facebook')
  async handleFacebookWebhook(@Body() body: any) {
    if (!body.entry?.length) return 'EVENT_RECEIVED';

    const data = body.entry[0];
    const externalId = data.id;

    const channelAccount = await this.db
      .select({
        accessToken: channelAccounts.accessToken,
        channelId: channelAccounts.id,
      })
      .from(channelAccounts)
      .where(eq(channelAccounts.externalId, externalId));

    if (!channelAccount.length) return 'EVENT_RECEIVED';

    const { channelId } = channelAccount[0];

    for (const event of data.messaging) {
      if (!event.message) continue;
      const normalized = this.normalizeFacebookMessage(channelId, event);
      await this.appService.pushMessageToQueue(normalized);
    }

    return 'EVENT_RECEIVED';
  }
}
