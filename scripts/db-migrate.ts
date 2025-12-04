import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { config } from '~/lib/config.server';

const db = drizzle(config.DRIZZLE_DATABASE_URL);
await migrate(db, { migrationsFolder: 'drizzle', migrationsSchema: 'public' });

console.log('Database migrated.');
process.exit(0);
