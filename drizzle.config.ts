import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DB_FILE_NAME) {
  throw new Error('DB_FILE_NAME is missing');
}

export default defineConfig({
  verbose: true,
  schema: './app/db/schema/index.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME,
  },
});
