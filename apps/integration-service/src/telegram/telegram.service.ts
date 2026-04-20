import { Injectable } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService  {
  
    async connectTelegram(botToken: string) {
        try {
            const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
            const data = await res.json();
            if(data.ok){
                const bot = new TelegramBot(botToken, { polling: true });
                bot.on('message', (msg) => {
                    console.log('Received message:', msg);
                });
            }

            return data;
        } catch (error) {
            console.error("Error connecting to Telegram:", error);
            throw new Error("Failed to connect to Telegram");
        }
    }

}