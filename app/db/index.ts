import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from '~/lib/config.server';
import * as schema from './schema';

export const db = drizzle(config.DRIZZLE_DATABASE_URL, {
  schema,
  logger: import.meta.env.DEV,
});
