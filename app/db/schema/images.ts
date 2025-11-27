import { sql } from 'drizzle-orm';
import { int, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const allowedImageStatuses = [
  'pending',
  'processing',
  'completed',
  'failed',
] as const;

export const imagesTable = sqliteTable('images', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  size: integer('size').notNull(),
  type: text('type').notNull(),
  path: text('path').notNull(),
  status: text('status', {
    enum: allowedImageStatuses,
  }).default('pending'),
  error: text('error'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});
