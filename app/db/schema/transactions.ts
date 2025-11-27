import { pgTable, real, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { defaultTimestamps } from './default-timestamps';

export const transactionsTable = pgTable('transactions', {
  id: serial('id').primaryKey(),
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
