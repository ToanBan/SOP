import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  customers,
  customerIdentities,
  conversations,
  conversationParticipants,
  messages,
  channelAccounts,
} from '@repo/db';
import { DB_PROVIDER } from './db/db.provide';
import { QUEUE_PROVIDER } from './queue/queue.provider';
import { MINIO_PROVIDER } from './minio/minio.provider';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject(DB_PROVIDER) private readonly db: any,
    @Inject(QUEUE_PROVIDER) private readonly queue: any,
    @Inject(MINIO_PROVIDER) private readonly minioClient: any,
  ) {}

  async onModuleInit() {
    await this.startConsumer();
  }

  async checkDb() {
    try {
      const result = await this.db.execute('SELECT 1');
      return {
        success: true,
        message: 'Database connected successfully',
        data: result,
      };
    } catch (error) {
      console.error('DB Connection Error:', error);
      return {
        success: false,
        message: 'Database connection failed',
        error,
      };
    }
  }

  async startConsumer() {
    const channel = this.queue.channel;
    await channel.prefetch(10);
    const exchange = 'chat_exchange';
    await channel.assertExchange(exchange, 'topic', { durable: true });
    const q = await channel.assertQueue('media_queue_v2', { durable: true });
    await channel.bindQueue(q.queue, exchange, 'message.media');

    channel.consume(q.queue, async (msg) => {
      try {
        const payload = JSON.parse(msg.content.toString());
        console.log('payload', payload);

        const { raw, accessToken, platform } = payload;

        let mediaUrl: string | null = null;

        if (platform === 'telegram') {
          const fileId = raw.document?.file_id;
          if (!fileId) {
            console.error('Không tìm thấy fileId');
            channel.nack(msg, false, false);
            return;
          }
          mediaUrl = await this.uploadTelegramFileToMinio(fileId, accessToken);
        } else if (platform === 'discord') {
          const attachment = raw.attachments?.[0];
          if (!attachment) {
            console.error('Không tìm thấy attachment');
            channel.nack(msg, false, false);
            return;
          }
          mediaUrl = await this.uploadDiscordFileToMinio(attachment);
        }

        payload.mediaUrl = mediaUrl;

        channel.publish(
          exchange,
          'message.media.processed',
          Buffer.from(JSON.stringify(payload)),
          { persistent: true },
        );

        channel.ack(msg);
      } catch (error) {
        console.error('Consumer error:', error);
        channel.nack(msg, false, false);
      }
    });
  }

  async uploadDiscordFileToMinio(attachment: {
    proxy_url: string;
    filename: string;
    size: number;
    content_type: string;
  }) {
    const response = await fetch(attachment.proxy_url);
    const nodeStream = Readable.fromWeb(response.body as any);

    const objectKey = `discord/${uuidv4()}_${attachment.filename}`;

    await this.minioClient.putObject(
      process.env.MINIO_BUCKET!,
      objectKey,
      nodeStream,
      attachment.size,
      { 'Content-Type': attachment.content_type },
    );

    return `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${objectKey}`;
  }

  async uploadTelegramFileToMinio(fileId: string, botToken: string) {
    const getFileRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`,
    );
    const getFileData = await getFileRes.json();

    console.log('get file data', getFileData);
    const filePath = getFileData.result.file_path;

    const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    const response = await fetch(downloadUrl);

    console.log('response', response);

    const nodeStream = Readable.fromWeb(response.body as any);

    const objectKey = `telegram/${uuidv4()}_${filePath.split('/').pop()}`;
    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = parseInt(
      response.headers.get('content-length') || '0',
    );

    await this.minioClient.putObject(
      process.env.MINIO_BUCKET!,
      objectKey,
      nodeStream,
      contentLength,
      { 'Content-Type': contentType },
    );

    const mediaUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${objectKey}`;
    return mediaUrl;
  }

  async uploadFileToBucket(file: any) {
    const objectKey = `uploads/${uuidv4()}_${file.originalname}`;

    await this.minioClient.putObject(
      process.env.MINIO_BUCKET!,
      objectKey,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    return `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${objectKey}`;
  }
}
