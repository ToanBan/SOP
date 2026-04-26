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



 
}
