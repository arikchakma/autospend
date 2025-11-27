import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';
import { defaultTimestamps } from './default-timestamps';

export const allowedImageStatuses = [
  'pending',
  'processing',
  'completed',
  'failed',
] as const;

export const imagesTable = pgTable('images', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  size: integer('size').notNull(),
  type: text('type').notNull(),
  path: text('path').notNull(),
  status: text('status', {
    enum: allowedImageStatuses,
  }).default('pending'),
  error: text('error'),
  ...defaultTimestamps,
});
