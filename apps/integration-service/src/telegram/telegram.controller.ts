import { Body, Controller, Post } from "@nestjs/common";
import { TelegramService } from "./telegram.service";

@Controller('integration')
export class TelegramController {
    constructor(private readonly telegramService: TelegramService){}


    @Post('telegram/connect')
    async connectTelegram(@Body() body: { botToken: string, integrationId: string }) {
        return this.telegramService.connectTelegram(body.botToken, body.integrationId);
    }

}