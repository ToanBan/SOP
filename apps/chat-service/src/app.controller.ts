import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { MessageRequestDTO } from './dto/MessageRequestDTO';
import { UpdateCustomerDTO } from './dto/UpdateCustomer';
import { ReplyMessageDTO } from './dto/ReplayMessageDTO';
import { CheckRole, ROLES, DecodeAuthGuard } from '@repo/auth';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('chat')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('allcustomer')
  async getAllCustomer() {
    return this.appService.getAllCustomers();
  }

  @Get('customers')
  @UseGuards(DecodeAuthGuard, CheckRole)
  @ROLES('sales', 'admin')
  async getCustomers() {
    return this.appService.getCustomers();
  }

  @Post('conversation')
  @UseGuards(DecodeAuthGuard, CheckRole)
  @ROLES('sales', 'admin')
  async getConversation(@Body() dto: MessageRequestDTO) {
    return this.appService.getConversationByCustomer(
      dto.customerId,
      dto.channelAccountId,
    );
  }

  @Get('messages/:conversationId')
  @UseGuards(DecodeAuthGuard, CheckRole)
  @ROLES('sales', 'admin')
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.appService.getMessagesByConversationId(conversationId);
  }

  @Put('customer/:customerId')
  @UseGuards(DecodeAuthGuard, CheckRole)
  @ROLES('sales', 'admin')
  async updateCustomer(
    @Body() dto: UpdateCustomerDTO,
    @Param('customerId') customerId: string,
  ) {
    return this.appService.updateCustomer(customerId, dto.email, dto.phone);
  }

  @Post('reply')
  @UseGuards(DecodeAuthGuard, CheckRole)
  @ROLES('sales', 'admin')
  @UseInterceptors(FileInterceptor('file'))
  async replyToCustomer(
    @Body() dto: ReplyMessageDTO,
    @UploadedFile() file?: any,
  ) {
    return this.appService.replyToCustomer(
      dto.conversationId,
      dto.message,
      dto.channelAccountId,
      file || null,
    );
  }

  @Get('group')
  @UseGuards(DecodeAuthGuard, CheckRole)
  @ROLES('sales', 'admin')
  async getConversationGroups() {
    return this.appService.getConversionGroup();
  }
}
