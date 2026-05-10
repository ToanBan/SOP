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
import { REDIS_PROVIDER } from 'src/redis/redis.provider';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly appService: AppService,
    @Inject(DB_PROVIDER) private readonly db: any,
    @Inject(REDIS_PROVIDER) private readonly redis: any,
  ) {}

  private normalizeTelegramMessage(
    channelId: string,
    message: any,
    accessToken: string,
  ) {
    let type = 'text';
    let mediaUrls: string[] = [];

    if (message.document) {
      type = 'media';
      mediaUrls = [message.document.file_id];
    } else if (message.photo) {
      type = 'media';
      const largest = message.photo[message.photo.length - 1];
      mediaUrls = [largest.file_id];
    }

    return {
      channelId,
      platform: 'telegram',
      conversationExternalId: message.chat.id.toString(),
      customerExternalId: message.from.id.toString(),
      messageExternalId: message.message_id.toString(),
      type,
      text: message.text || null,
      mediaUrls,
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
      if (!message) return { ok: true };
      const channelAccount = await this.db
        .select({ accessToken: channelAccounts.accessToken })
        .from(channelAccounts)
        .where(eq(channelAccounts.id, channelId));

      const accessToken = channelAccount[0].accessToken;
      const normalized = this.normalizeTelegramMessage(
        channelId,
        message,
        accessToken,
      );

      if (!message.media_group_id) {
        await this.appService.pushMessageToQueue(normalized);
        return { ok: true };
      }
      const redisKey = `tg_group:${message.media_group_id}`;
      const existing = await this.redis.get(redisKey);
      let buffer: any;
      if (!existing) {
        buffer = normalized;
        await this.redis.set(redisKey, JSON.stringify(buffer), 'PX', 2000);
      } else {
        buffer = JSON.parse(existing);
        if (message.document?.file_id) {
          const fileId = message.document.file_id;

          if (!buffer.mediaUrls.includes(fileId)) {
            buffer.mediaUrls.push(fileId);
          }
        }
        await this.appService.pushMessageToQueue(buffer);
      }

      return { ok: true };
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
    let mediaUrls: string[] = [];

    if (attachments?.length) {
      type = 'media';
      mediaUrls = attachments.map((a: any) => a.payload?.url).filter(Boolean);
    }

    return {
      channelId,
      platform: 'facebook',
      conversationExternalId: event.sender.id.toString(),
      customerExternalId: event.sender.id.toString(),
      messageExternalId: message.mid.toString(),
      type,
      text: message.text || null,
      mediaUrls,
      raw: event,
    };
  }

  @Post('facebook')
  async handleFacebookWebhook(@Body() body: any) {
    try {
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

        if (!normalized.mediaUrls.length) {
          await this.appService.pushMessageToQueue(normalized);
          continue;
        }

        const senderId = event.sender.id;
        const redisKey = `fb_group:${senderId}`;
        const existing = await this.redis.get(redisKey);

        if (!existing) {
          await this.redis.set(
            redisKey,
            JSON.stringify(normalized),
            'PX',
            2000,
          );
          setTimeout(async () => {
            const current = await this.redis.get(redisKey);
            if (!current) return;
            await this.redis.del(redisKey);
            await this.appService.pushMessageToQueue(JSON.parse(current));
          }, 2000);
        } else {
          const buffer = JSON.parse(existing);
          for (const url of normalized.mediaUrls) {
            if (!buffer.mediaUrls.includes(url)) {
              buffer.mediaUrls.push(url);
            }
          }
          await this.appService.pushMessageToQueue(buffer);
        }
      }

      return 'EVENT_RECEIVED';
    } catch (error) {
      return {success:false, message:`Failed ${error}`}
    }
  }
}
