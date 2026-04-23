import { Body, Controller, Param, Post } from '@nestjs/common';
import { AppService } from 'src/app.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly appService: AppService) {}

  private normalizeTelegramMessage(channelId: string, message: any) {
    const hasText = message.text;
    const hasPhoto = message.photo;
    const hasDocument = message.document;
    const hasVideo = message.video;

    let type = 'text';
    let mediaUrl = null;

    if (hasPhoto) {
      type = 'image';
      mediaUrl = message.photo?.at(-1)?.file_id;
    }

    if (hasDocument) {
      type = 'file';
      mediaUrl = message.document.file_id;
    }

    if (hasVideo) {
      type = 'video';
      mediaUrl = message.video.file_id;
    }

    return {
      channelId,
      platform: 'telegram',
      conversationExternalId: message.chat.id.toString(),
      customerExternalId: message.from.id.toString(),
      messageExternalId: message.message_id.toString(),
      type,
      text: message.text || null,
      mediaUrl,

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
      console.log('Received Telegram webhook:', message);
      if (!message) return { ok: true };
      const normalized = this.normalizeTelegramMessage(channelId, message);
      await this.appService.pushMessageToQueue(normalized);
      return { success: true };
    } catch (error) {
      console.error('Error handling Telegram webhook:', error);
      return { success: false, message: 'Failed to handle Telegram webhook' };
    }
  }

  private normalizeDiscordMessage(channelId: string, message: any) {
    const attachment = message.attachments?.[0];
    let type = 'text';
    let mediaUrl = null;

    if (attachment) {
      const contentType = attachment.content_type || '';
      if (contentType.startsWith('image/')) type = 'image';
      else if (contentType.startsWith('video/')) type = 'video';
      else type = 'file';

      mediaUrl = attachment.url;
    }

    return {
      channelId,
      platform: 'discord',
      conversationExternalId: message.channel_id,
      customerExternalId: message.author_id,
      messageExternalId: message.id,
      type,
      text: message.content || null,
      mediaUrl,
      raw: message,
    };
  }

  @Post('discord/:channelId')
  async handleDiscordWebhook(
    @Body() body: any,
    @Param('channelId') channelId: string,
  ) {
    try {
      console.log('Received Discord data:', body);
      if (!body) return { ok: true };

      const normalized = this.normalizeDiscordMessage(channelId, body);

      await this.appService.pushMessageToQueue(normalized);

      return { success: true };
    } catch (error) {
      console.error('Error handling Discord webhook:', error);
      return { success: false, message: 'Failed to handle Discord webhook' };
    }
  }
}
