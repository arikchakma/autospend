import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { config } from '~/lib/config.server';
import * as schema from './schema';

const sqlite = new Database(config.DB_FILE_NAME);

export const db = drizzle(sqlite, {
  schema,
  logger: process.env?.NODE_ENV === 'development' ? true : undefined,
});
