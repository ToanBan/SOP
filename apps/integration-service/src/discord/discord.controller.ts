import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DecodeAuthGuard, CurrentUser, CheckRole, ROLES} from '@repo/auth';

@Controller('integration')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  @Post('discord/connect')
  @UseGuards(DecodeAuthGuard, CheckRole)
  @ROLES('admin')
  async connectTelegram(
    @CurrentUser('sub') userId: string,
    @Body() body: { botToken: string},
  ) {
    return this.discordService.connectDiscord(
      body.botToken,
      userId
    );
  }
}
