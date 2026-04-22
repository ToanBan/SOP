import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { MessageRequestDTO } from './dto/MessageRequestDTO';
import { UpdateCustomerDTO } from './dto/UpdateCustomer';
@Controller('chat')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('customers')
  async getCustomers() {
    return this.appService.getCustomers();
  }

  @Post('messages')
  async getMessages(@Body() dto: MessageRequestDTO) {
    return this.appService.getConversationsByCustomerId(
      dto.customerId,
      dto.channelAccountId,
    );
  }

  @Put('customer/:customerId')
  async updateCustomer(
    @Body() dto: UpdateCustomerDTO,
    @Param('customerId') customerId: string,
  ) {
    return this.appService.updateCustomer(customerId, dto.email, dto.phone);
  }
}
