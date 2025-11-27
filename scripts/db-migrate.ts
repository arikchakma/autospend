import 'dotenv/config';

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { config } from '~/lib/config.server';

const sqlite = new Database(config.DB_FILE_NAME);
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: 'drizzle' });
sqlite.close();

console.log('Database migrated.');
