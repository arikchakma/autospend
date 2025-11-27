import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { defaultTimestamps } from './default-timestamps';

export const allowedAuthProvider = ['google'] as const;

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
  authProvider: text('auth_provider', {
    enum: allowedAuthProvider,
  }).notNull(),
  verifiedAt: timestamp('verified_at'),
  ...defaultTimestamps,
});
