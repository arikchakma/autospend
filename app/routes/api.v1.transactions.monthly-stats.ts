import { db } from '~/db';
import { transactionsTable } from '~/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { getUserFromCookie } from '~/lib/jwt.server';
import { json } from '~/lib/response.server';
import { redirect } from 'react-router';
import type { Route } from './+types/api.v1.transactions.monthly-stats';
import { allowedCategories } from '~/lib/transaction';

export type MonthlyChartData = {
  month: string;
  food: number;
  transport: number;
  shopping: number;
  entertainment: number;
  accommodation: number;
  health: number;
  education: number;
  bills: number;
  other: number;
  [key: string]: number | string;
};

export async function loader(args: Route.LoaderArgs) {
  const user = await getUserFromCookie(args.request);
  if (!user) {
    throw redirect('/login');
  }

  const chartStartOfCurrentMonth = DateTime.now().startOf('month');
  const chartStartDate = chartStartOfCurrentMonth.minus({ months: 11 });

  const rawMonthlyData = await db
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

  const monthlyDataMap = new Map<string, MonthlyChartData>();

  for (let i = 11; i >= 0; i--) {
    const d = DateTime.now().minus({ months: i });
    const key = d.toFormat('yyyy-MM');
    monthlyDataMap.set(key, {
      month: d.toFormat('MMMM'),
      food: 0,
      transport: 0,
      shopping: 0,
      entertainment: 0,
      accommodation: 0,
      health: 0,
      education: 0,
      bills: 0,
      other: 0,
    });
  }

  for (const row of rawMonthlyData) {
    const entry = monthlyDataMap.get(row.month);
    if (entry) {
      const category =
        allowedCategories.find((c) => c === row.category) || 'other';
      entry[category] = (entry[category] || 0) + row.total;
    }
  }

  const monthlyChartData = Array.from(monthlyDataMap.values());

  return json({ data: monthlyChartData });
}


