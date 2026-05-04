import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { DecodeAuthGuard, CurrentUser, CheckRole, ROLES} from '@repo/auth';
import { CheckBlackList } from 'src/guards/checkblacklist.guard';
@Controller('integration')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('telegram/connect')
  @UseGuards(DecodeAuthGuard, CheckRole)
  @ROLES('admin')
  async connectTelegram(
    @CurrentUser('sub') userId: string,
    @Body() body: { botToken: string},
  ) {
    return this.telegramService.connectTelegram(
      body.botToken,
      userId
    );
  }


  @Get("me")
  @UseGuards(DecodeAuthGuard)
  async getProfile(@CurrentUser('roles') roles:string[]){
    return roles
  }
}
