import {
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CheckBlackList } from './guards/checkblacklist.guard';
import { CheckRole, ROLES } from '@repo/auth';

@Controller('media')
export class AppController {
  constructor(private readonly appService: AppService) {}

  

  @Post('upload')
  @UseGuards(CheckBlackList, CheckRole)
  @ROLES('admin', 'marketing')
  @UseInterceptors(FilesInterceptor('files', 10))
  async upload(@UploadedFiles() files: any) {
    try {
      const urls = await Promise.all(
        files.map((file) => this.appService.uploadFileToBucket(file)),
      );
      return urls;
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, message: `Upload thất bại ${error}` };
    }
  }
}