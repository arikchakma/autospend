import { sql } from 'drizzle-orm';
import { int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const transactionsTable = sqliteTable('transactions', {
  id: int('id').primaryKey({ autoIncrement: true }),
  amount: integer('amount').notNull(),
  description: text('description'),
  currency: text('currency').notNull(),
  timestamp: integer('timestamp', {
    mode: 'timestamp',
  }).notNull(),
  image: text('image'),
  category: text('category').default('uncategorized').notNull(),
  merchant: text('merchant'),

  cardNumber: text('card_number').default(sql`NULL`),
  cardType: text('card_type').default(sql`NULL`),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(strftime('%s', 'now'))`),
});
