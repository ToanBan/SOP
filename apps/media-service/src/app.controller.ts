import {
  Controller,
  Get,
  Inject,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('media')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async checkDb() {
    return this.appService.checkDb();
  }

  @Get('/hello')
  async hello() {
    return 'hello';
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  async upload(@UploadedFiles() files: any) {
    try {
      const urls = await Promise.all(
        files.map((file) => this.appService.uploadFileToBucket(file)),
      );
      return urls
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, message: `Upload thất bại ${error}` };
    }
  }
}
