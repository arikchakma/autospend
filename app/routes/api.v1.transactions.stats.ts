import { db } from '~/db';
import { transactionsTable } from '~/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { getUserFromCookie } from '~/lib/jwt.server';
import { json } from '~/lib/response.server';
import { redirect } from 'react-router';
import type { Route } from './+types/api.v1.transactions.stats';

export async function loader(args: Route.LoaderArgs) {
  const user = await getUserFromCookie(args.request);
  if (!user) {
    throw redirect('/login');
  }

  const chartStartOfCurrentMonth = DateTime.now().startOf('month');
  const chartStartDate = chartStartOfCurrentMonth.minus({ months: 11 });

  const stats = await db
    .select({
      month: sql<string>`to_char(${transactionsTable.timestamp}, 'YYYY-MM')`,
      category: transactionsTable.category,
      total: sql<number>`sum(${transactionsTable.amount})`,
    })
    .from(transactionsTable)
    .where(
      and(
        gte(transactionsTable.timestamp, chartStartDate.toJSDate()),
        eq(transactionsTable.userId, user.id)
      )
    )
    .groupBy(
      sql<string>`to_char(${transactionsTable.timestamp}, 'YYYY-MM')`,
      transactionsTable.category
    );

  return json({ stats });
}
