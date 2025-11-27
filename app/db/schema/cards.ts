import { sql } from 'drizzle-orm';
import { int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const cardsTable = sqliteTable('cards', {
  id: int('id').primaryKey({ autoIncrement: true }),
  number: text('number').notNull(),
  type: text('type').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(strftime('%s', 'now'))`),
});
