import { z } from 'zod';

const envVariables = z.object({
  DRIZZLE_DATABASE_URL: z.string(),

  S3_API_URL: z.string(),
  S3_BUCKET_NAME: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  GOOGLE_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('1h'),

  QSTASH_URL: z.string(),
  QSTASH_TOKEN: z.string(),
  QSTASH_CURRENT_SIGNING_KEY: z.string(),
  QSTASH_NEXT_SIGNING_KEY: z.string(),
});

export const config = envVariables.parse(process.env);

const baseUrl = 'https://app.daroyan.com';
export const IMAGE_PROCESS_QUEUE_URL = `${baseUrl}/api/v1/images/process`;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
