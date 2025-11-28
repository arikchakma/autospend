import {
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { defaultTimestamps } from './default-timestamps';
import { usersTable } from './users';
import { relations } from 'drizzle-orm';

export const transactionsTable = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => usersTable.id),
  amount: real('amount').notNull(),
  description: text('description'),
  currency: text('currency').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  image: text('image'),
  category: text('category').default('other').notNull(),
  merchant: text('merchant'),

  cardNumber: text('card_number'),
  cardType: text('card_type'),

  ...defaultTimestamps,
});

export const transactionsRelations = relations(
  transactionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [transactionsTable.userId],
      references: [usersTable.id],
    }),
  })
);
