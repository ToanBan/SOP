import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { MessageRequestDTO } from './dto/MessageRequestDTO';
import { UpdateCustomerDTO } from './dto/UpdateCustomer';
import { ReplyMessageDTO } from './dto/ReplayMessageDTO';


@Controller('chat')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('customers')
  async getCustomers() {
    return this.appService.getCustomers();
  }

  @Post('conversation')
  async getConversation(@Body() dto: MessageRequestDTO) {
    return this.appService.getConversationByCustomer(
      dto.customerId,
      dto.channelAccountId,
    );
  }

  @Get('messages/:conversationId')
  async getMessages(@Param('conversationId') conversationId: string) {
    return this.appService.getMessagesByConversationId(conversationId);
  }

  @Put('customer/:customerId')
  async updateCustomer(
    @Body() dto: UpdateCustomerDTO,
    @Param('customerId') customerId: string,
  ) {
    return this.appService.updateCustomer(customerId, dto.email, dto.phone);
  }

  @Post('reply')
  async replyToCustomer(@Body() dto: ReplyMessageDTO) {
    console.log(dto);
    return this.appService.replyToCustomer(
      dto.conversationId,
      dto.message,
      dto.channelAccountId,
      dto.file || null,
    );
  }
}