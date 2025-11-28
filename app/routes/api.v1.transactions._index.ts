import z from 'zod/v4';
import { lte, gte, and, desc, count, sum } from 'drizzle-orm';
import { db } from '~/db';
import { transactionsTable } from '~/db/schema';
import type { Route } from './+types/api.v1.transactions._index';
import { json } from '~/lib/response.server';
import { DateTime } from 'luxon';

export async function loader(args: Route.LoaderArgs) {
  try {
    const querySchema = z.object({
      month: z
        .string()
        .optional()
        .transform((val) =>
          // The date will be in the format of DD-MM-YYYY
          // for better compatibility with the frontend date picker
          val
            ? DateTime.fromFormat(val, 'dd-MM-yyyy').startOf('month')
            : undefined
        )
        .default(DateTime.now().startOf('month')),
      page: z.coerce.number().optional().default(1),
      limit: z.coerce.number().optional().default(10),
    });

    const searchParams = Object.fromEntries(
      new URL(args.request.url).searchParams
    );
    const { month, page, limit } = querySchema.parse(searchParams);
    const startDate = month.startOf('month');
    const endDate = month.endOf('month');

    const condition = and(
      gte(transactionsTable.timestamp, startDate.toJSDate()),
      lte(transactionsTable.timestamp, endDate.toJSDate())
    );

    const { count: totalCount, total: totalAmount } = await db
      .select({ count: count(), total: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(condition)
      .then((result) => ({
        count: result?.[0]?.count ?? 0,
        total: result?.[0]?.total ?? 0,
      }));

    const totalPages = Math.ceil(Number(totalCount) / Number(limit));

    const offset = (page - 1) * limit;
    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(condition)
      .orderBy(desc(transactionsTable.timestamp))
      .limit(limit)
      .offset(offset);

    return json({
      data: transactions,
      page,
      limit,
      totalCount,
      totalPages,
      totalAmount,
    });
  } catch (error) {
    console.error('Failed to get transactions:', error);
    return json(
      {
        status: 500,
        message: 'Failed to get transactions',
        errors: [{ message: 'Failed to get transactions' }],
      },
      { status: 500 }
    );
  }
}
