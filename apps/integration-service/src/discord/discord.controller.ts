import { Body, Controller, Post } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Controller('integration')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  @Post('discord/connect')
  async connectTelegram(
    @Body() body: { botToken: string; integrationId: string },
  ) {
    return this.discordService.connectDiscord(
      body.botToken,
      body.integrationId,
    );
  }
}
