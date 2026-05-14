import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ReadNotificationDTO } from './dto/ReadNotificationDTO';
import { CheckRole, ROLES, DecodeAuthGuard } from '@repo/auth';
import { CheckBlackList } from './guards/checkblacklist.guard';
@Controller('notification')
@UseGuards(DecodeAuthGuard, CheckBlackList, CheckRole)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('unread-count')
  @ROLES('sales', 'admin')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user.id;
    return this.appService.getUnreadCount(userId);
  }

  @Get(':page')
  @ROLES('sales', 'admin')
  async getNotification(
    @Param('page', ParseIntPipe) page: number,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.appService.getNotifications(page, 5, userId);
  }

  @Post('read')
  @ROLES('sales', 'admin')
  async readNotification(@Body() dto: ReadNotificationDTO, @Req() req: any) {
    const userId = req.user.id;
    return this.appService.readNotification(dto.notificationId, userId);
  }
}
