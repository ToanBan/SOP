import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
@Controller('integration')
export class AppController {
  constructor(private readonly appService: AppService) {}

  

  @Get('statis')
  async getStatis() {
    return this.appService.getStatis();
  }


  
  
}
