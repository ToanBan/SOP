import { Module } from '@nestjs/common';
import { MINIO_PROVIDER } from './minio.provider';
import * as Minio from 'minio';
@Module({
  providers: [
    {
      provide: MINIO_PROVIDER,
      useFactory: async () => {
        const client = new Minio.Client({
          endPoint: process.env.MINIO_ENDPOINT!,
          port: 9000,
          useSSL: false,
          accessKey: process.env.MINIO_ACCESS_KEY,
          secretKey: process.env.MINIO_SECRET_KEY,
        });

        const bucketName = process.env.MINIO_BUCKET!;

        const exists = await client.bucketExists(bucketName);
        if (!exists) await client.makeBucket(bucketName);

        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };
        await client.setBucketPolicy(bucketName, JSON.stringify(policy));
        return client;
      },
    },
  ],
  exports: [MINIO_PROVIDER],
})
export class MiniOModule {}
