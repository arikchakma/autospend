import z from 'zod/v4';
import { lte, gte, and, desc, count, sum, eq } from 'drizzle-orm';
import { db } from '~/db';
import { transactionsTable } from '~/db/schema';
import type { Route } from './+types/api.v1.transactions._index';
import { json } from '~/lib/response.server';
import { DateTime } from 'luxon';
import { redirect } from 'react-router';
import { getUserFromCookie } from '~/lib/jwt.server';

export async function loader(args: Route.LoaderArgs) {
  const user = await getUserFromCookie(args.request);
  if (!user) {
    return json(
      {
        status: 401,
        message: 'Unauthorized',
        errors: [{ message: 'Unauthorized' }],
      },
      { status: 401 }
    );
  }

  try {
    const querySchema = z.object({
      from: z
        .string()
        .transform((val) => DateTime.fromFormat(val, 'dd-MM-yyyy')),
      to: z.string().transform((val) => DateTime.fromFormat(val, 'dd-MM-yyyy')),
      page: z.coerce.number().optional().default(1),
      limit: z.coerce.number().optional().default(100),
    });

    const searchParams = Object.fromEntries(
      new URL(args.request.url).searchParams
    );
    const { from, to, page, limit } = querySchema.parse(searchParams);

    const condition = and(
      eq(transactionsTable.userId, user.id),
      gte(transactionsTable.timestamp, from.toJSDate()),
      lte(transactionsTable.timestamp, to.toJSDate())
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
