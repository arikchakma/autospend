import { pgTable, text, integer, serial } from 'drizzle-orm/pg-core';
import { defaultTimestamps } from './default-timestamps';
import { usersTable } from './users';
import { relations } from 'drizzle-orm';

export const allowedImageStatuses = [
  'pending',
  'processing',
  'completed',
  'failed',
] as const;

export const imagesTable = pgTable('images', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => usersTable.id),
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

export const imagesRelations = relations(imagesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [imagesTable.userId],
    references: [usersTable.id],
  }),
}));
