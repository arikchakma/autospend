import { S3 } from '@aws-sdk/client-s3';
import { config } from './config.server';

export const s3Client = new S3({
  region: 'auto',
  credentials: {
    accessKeyId: config.S3_ACCESS_KEY_ID,
    secretAccessKey: config.S3_SECRET_ACCESS_KEY,
  },
  endpoint: config.S3_API_URL,
});

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
