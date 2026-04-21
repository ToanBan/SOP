import { Body, Controller, Post } from '@nestjs/common';

@Controller('webhooks')
export class WebhookController {


  @Post('telegram')
  async handleTelegramWebhook(@Body() body: any) {
    try {
      console.log('Received Telegram webhook', body);
      const message = body.message;

      const chatId = message.chat.id;
      const text = message.text;


      return { success: message };
    } catch (error) {
      console.error('Error handling Telegram webhook:', error);
      return { success: false, message: 'Failed to handle Telegram webhook' };
    }
  }
}
