import {
  index,
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

export const transactionsTable = pgTable(
  'transactions',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => usersTable.id),
    amount: real('amount').notNull(),
    description: text('description'),
    currency: text('currency').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    image: text('image'),
    category: text('category').default('other').notNull(),
    merchant: text('merchant'),

    cardNumber: text('card_number'),
    cardType: text('card_type'),

    ...defaultTimestamps,
  },
  (table) => ({
    userIdIndex: index('user_id_index').on(table.userId),
    userIdTimestampIndex: index('user_id_timestamp_index').on(
      table.userId,
      table.timestamp
    ),
  })
);

export const transactionsRelations = relations(
  transactionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [transactionsTable.userId],
      references: [usersTable.id],
    }),
  })
);
