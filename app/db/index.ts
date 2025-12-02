import { drizzle } from 'drizzle-orm/postgres-js';
import { config } from '~/lib/config.server';
import * as schema from './schema';
import postgres from 'postgres';

const client = postgres(config.DRIZZLE_DATABASE_URL, { prepare: false });

export const db = drizzle(client, {
  schema,
  logger: import.meta.env.DEV,
});
