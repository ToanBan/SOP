import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
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
import { ReplyCommentDTO } from './dto/ReplyCommentDTO';
@Controller('marketing')
@UseGuards(DecodeAuthGuard, CheckBlackList, CheckRole)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ROLES('marketing', 'admin')
  async getAllChannelAccount() {
    return this.appService.getAllChannelAccount();
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

  @Get('channelAccount/:id')
  @ROLES('marketing', 'admin')
  async getReactions(@Param('id') id: string) {
    return this.appService.getReactionsPostFacebook(id);
  }

  @Get('channelAccount/comments/:id')
  @ROLES('marketing', 'admin')
  async getComments(@Param('id') id: string) {
    return this.appService.getCommentsPostFacebook(id);
  }


  @Post("campaign/reply")
  async replyComment(@Body() dto: ReplyCommentDTO){
    return this.appService.replyCommentPostFacebook(dto.campaignId, dto.message, dto.commentId);
  }
}
