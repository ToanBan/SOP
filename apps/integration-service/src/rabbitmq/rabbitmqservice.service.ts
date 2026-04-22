import { Inject, Injectable} from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  constructor(@Inject('QUEUE_CONNECTION') private readonly connection: amqp.Connection) {}

  async hello(queue: string, message: any) {
 
  }

 
}