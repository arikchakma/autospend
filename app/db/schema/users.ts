import { sql } from 'drizzle-orm';
import { int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const allowedAuthProvider = ['google'] as const;

export const usersTable = sqliteTable('users', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name', {
    length: 255,
  }).notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  authProvider: text('auth_provider', {
    enum: allowedAuthProvider,
  }).notNull(),
  verifiedAt: integer('verified_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});
