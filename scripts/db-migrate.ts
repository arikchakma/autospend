import 'dotenv/config';

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { config } from '~/lib/config.server';

const client = postgres(config.DRIZZLE_DATABASE_URL, { prepare: false });
const db = drizzle(client);

await migrate(db, { migrationsFolder: 'drizzle' });
client.end();

console.log('Database migrated.');
