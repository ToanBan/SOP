import * as Minio from 'minio';

let client: Minio.Client | null = null;

export const connectionMinio = async (): Promise<Minio.Client> => {
  if (client) return client;

  const endPoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const bucketName = process.env.MINIO_BUCKET;

  if (!endPoint || !accessKey || !secretKey || !bucketName) {
    throw new Error('Missing MinIO environment variables');
  }

  client = new Minio.Client({
    endPoint,
    port: Number(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey,
    secretKey,
  });

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
};