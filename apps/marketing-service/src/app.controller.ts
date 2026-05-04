import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CampaignDTO } from './dto/CampaignDTO';
import { CheckRole, ROLES, DecodeAuthGuard } from '@repo/auth';
import { CheckBlackList } from './guards/checkblacklist.guard';


@Controller('marketing')
@UseGuards(DecodeAuthGuard, CheckBlackList, CheckRole) 
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ROLES('marketing', 'admin')
  async getAllConversations() {
    return this.appService.getAllConversations();
  }

  @Post('create')
  @ROLES('marketing', 'admin')
  @UseInterceptors(FilesInterceptor('files', 10))
  async createCampaign(@UploadedFiles() files: any, @Body() dto: CampaignDTO) {
    return this.appService.createCampaign(
      dto.content,
      dto.conversationIds,
      dto.scheduledAt,
      files,
    );
  }

  @Get('campaign')
  @ROLES('marketing', 'admin')
  async getAllCampaign() {
    return this.appService.getAllCampaign();
  }



}