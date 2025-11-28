import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { defaultTimestamps } from './default-timestamps';
import { relations } from 'drizzle-orm';
import { transactionsTable } from './transactions';
import { imagesTable } from './images';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  verifiedAt: timestamp('verified_at'),
  ...defaultTimestamps,
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  transactions: many(transactionsTable),
  images: many(imagesTable),
}));
