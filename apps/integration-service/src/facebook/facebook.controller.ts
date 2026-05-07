import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { DecodeAuthGuard, CurrentUser, CheckRole, ROLES } from '@repo/auth';

@Controller('integration')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @Post('facebook/pages')
  async getPages(@Body('accessToken') accessToken: string) {
    return this.facebookService.getPages(accessToken);
  }

  @Post('facebook/connect')
  @UseGuards(DecodeAuthGuard)
  async connectFacebook(@Body() body: any, @CurrentUser('sub') userId: string) {

    return this.facebookService.connectFacebook(
      body.accessToken,
      body.pageId,
      userId,
    );
  }
}
