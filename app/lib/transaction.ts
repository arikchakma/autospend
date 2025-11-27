export const allowedCategories = [
  'food',
  'transport',
  'shopping',
  'entertainment',
  'accommodation',
  'health',
  'education',
  'bills',
  'other',
] as const;

export type TransactionCategory = (typeof allowedCategories)[number];
