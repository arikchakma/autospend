import type { InferSelectModel } from 'drizzle-orm';
import type { imagesTable, transactionsTable, usersTable } from './schema';
import type { cardsTable } from './schema/cards';

export type * from './schema';

export type User = InferSelectModel<typeof usersTable>;
export type Image = InferSelectModel<typeof imagesTable>;
export type Transaction = InferSelectModel<typeof transactionsTable>;
export type Card = InferSelectModel<typeof cardsTable>;
