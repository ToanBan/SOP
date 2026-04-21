import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
    this.connection = await amqp.connect(
      'amqp://guest:guest@rabbitmq:5672',
    );

    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue('telegram_messages');

    console.log('RabbitMQ connected');
  }

  async publish(queue: string, message: any) {
    this.channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(message)),
    );
  }
}