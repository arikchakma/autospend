import type { InferSelectModel } from 'drizzle-orm';
import type { imagesTable, transactionsTable, usersTable } from './schema';

export type * from './schema';

export type User = InferSelectModel<typeof usersTable>;
export type Image = InferSelectModel<typeof imagesTable>;
export type Transaction = InferSelectModel<typeof transactionsTable>;
