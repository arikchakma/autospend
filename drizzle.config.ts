import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DRIZZLE_DATABASE_URL) {
  throw new Error('DRIZZLE_DATABASE_URL is missing');
}

export default defineConfig({
  verbose: true,
  schema: './app/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DRIZZLE_DATABASE_URL,
  },
});
