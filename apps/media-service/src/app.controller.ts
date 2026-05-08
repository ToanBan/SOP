import {
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('media')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  async upload(
    @UploadedFiles() files: any,
    @Headers('x-internal-key') secret: string,
  ) {
    try {

      if (secret !== process.env.INTERNAL_KEY) {
        throw new UnauthorizedException('Invalid internal secret');
      }

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
