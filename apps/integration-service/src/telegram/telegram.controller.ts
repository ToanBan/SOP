import { Body, Controller, Post } from "@nestjs/common";
import { TelegramService } from "./telegram.service";

@Controller('integration/telegram')
export class TelegramController {
    constructor(private readonly telegramService: TelegramService){}

    async connectTelegram(@Body() body: { botToken: string }) {
        return this.telegramService.connectTelegram(body.botToken);
    }
}