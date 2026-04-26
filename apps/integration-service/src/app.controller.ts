import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('integration')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/")
  async getAllIntegrations() {
    return this.appService.getAllIntegrations();
  }

  @Get('statis')
  async getStatis() {
    return this.appService.getStatis();
  }

  @Get(':id')
  async getChannelAccountByIntegrationId(@Param('id') id: string) {
    return this.appService.getChannelAccountByIntegrationId(id);
  }
}
