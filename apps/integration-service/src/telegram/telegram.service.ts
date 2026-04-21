import { Injectable } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService  {
  
    async connectTelegram(botToken: string) {
        try {
            const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
          

            return res;
        } catch (error) {
            console.error("Error connecting to Telegram:", error);
            throw new Error("Failed to connect to Telegram");
        }
    }

}