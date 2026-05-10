import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
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

        const { raw, accessToken, platform, mediaUrls: rawMediaUrls } = payload;
        if (!rawMediaUrls?.length) {
          console.error('Not found mediaUrls');
          channel.nack(msg, false, false);
          return;
        }

        let mediaUrls: string[] = [];
        if (platform === 'telegram') {
          mediaUrls = await Promise.all(
            rawMediaUrls.map((fileId: string) =>
              this.uploadTelegramFileToMinio(fileId, accessToken),
            ),
          );
        } else if (platform === 'discord') {
          mediaUrls = await Promise.all(
            rawMediaUrls.map((url: any) => this.uploadDiscordFileToMinio(url)),
          );
        } else if (platform == 'facebook') {
          mediaUrls = await Promise.all(
            rawMediaUrls.map((url: string) =>
              this.uploadFacebookFileToMinio(url),
            ),
          );
        }

        payload.mediaUrls = mediaUrls;

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

  async uploadDiscordFileToMinio(proxyUrl: string) {
    try {
      const response = await fetch(proxyUrl);
      const nodeStream = Readable.fromWeb(response.body as any);

      const contentType =
        response.headers.get('content-type') || 'application/octet-stream';
      const contentLength = parseInt(
        response.headers.get('content-length') || '0',
      );
      const fileName = proxyUrl.split('/').pop() || 'file';

      const objectKey = `discord/${uuidv4()}_${fileName}`;

      await this.minioClient.putObject(
        process.env.MINIO_BUCKET!,
        objectKey,
        nodeStream,
        contentLength,
        { 'Content-Type': contentType },
      );

      return `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${objectKey}`;
    } catch (error) {
      return { success: false, message: `Failed ${error}` };
    }
  }

  async uploadTelegramFileToMinio(fileId: string, botToken: string) {
    try {
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
    } catch (error) {
      return { success: false, message: `Failed ${error}` };
    }
  }

  async uploadFacebookFileToMinio(mediaUrl: string) {
    try {
      const response = await fetch(mediaUrl);

      const contentType =
        response.headers.get('content-type') || 'application/octet-stream';
      const contentLength = parseInt(
        response.headers.get('content-length') || '0',
      );

      const nodeStream = Readable.fromWeb(response.body as any);

      const ext = contentType.split('/')[1] || 'bin';
      const objectKey = `facebook/${uuidv4()}.${ext}`;

      await this.minioClient.putObject(
        process.env.MINIO_BUCKET!,
        objectKey,
        nodeStream,
        contentLength,
        { 'Content-Type': contentType },
      );

      return `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${objectKey}`;
    } catch (error) {
      return { success: false, message: `Failed ${error}` };
    }
  }

  async uploadFileToBucket(files: any[]) {
    const urls = await Promise.all(
      files.map(async (file) => {
        const objectKey = `uploads/${uuidv4()}_${file.originalname}`;
        await this.minioClient.putObject(
          process.env.MINIO_BUCKET!,
          objectKey,
          file.buffer,
          file.size,
          { 'Content-Type': file.mimetype },
        );
        return `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET}/${objectKey}`;
      }),
    );
    return urls;
  }
}
