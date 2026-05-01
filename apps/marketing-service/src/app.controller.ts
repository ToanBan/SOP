import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CampaignDTO } from './dto/CampaignDTO';
@Controller('marketing')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getAllConversations() {
    return this.appService.getAllConversations();
  }

  @Post('create')
  @UseInterceptors(FilesInterceptor('files', 10))
  async createCampaign(@UploadedFiles() files: any, @Body() dto: CampaignDTO) {
    return this.appService.createCampaign(
      dto.content,
      dto.conversationIds,
      dto.scheduledAt,
      files,
    );
  }
}
