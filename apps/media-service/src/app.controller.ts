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
    @UploadedFiles() files: any[],
    @Headers('x-internal-key') secret: string,
  ) {
    if (secret !== process.env.INTERNAL_KEY) {
      throw new UnauthorizedException('Invalid internal secret');
    }
    return this.appService.uploadFileToBucket(files);
  }
}
