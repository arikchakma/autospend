import { z } from 'zod';

const envVariables = z.object({
  DB_FILE_NAME: z.string(),

  S3_API_URL: z.string(),
  S3_BUCKET_NAME: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  GOOGLE_API_KEY: z.string(),
});

export const config = envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
