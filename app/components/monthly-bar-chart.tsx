import { Bar, BarChart, XAxis } from 'recharts';

import { Card, CardContent } from '~/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';
import type { ChartConfig } from '~/components/ui/chart';
import { humanizeNumber } from '~/lib/formatter';

const chartData = [
  {
    month: 'January',
    food: 120,
    transport: 40,
    shopping: 50,
    entertainment: 30,
    accommodation: 0,
    health: 20,
    education: 0,
    bills: 100,
    other: 10,
  },
  {
    month: 'February',
    food: 130,
    transport: 45,
    shopping: 60,
    entertainment: 40,
    accommodation: 0,
    health: 0,
    education: 0,
    bills: 110,
    other: 15,
  },
  {
    month: 'March',
    food: 140,
    transport: 50,
    shopping: 40,
    entertainment: 35,
    accommodation: 0,
    health: 10,
    education: 0,
    bills: 105,
    other: 12,
  },
  {
    month: 'April',
    food: 125,
    transport: 42,
    shopping: 70,
    entertainment: 50,
    accommodation: 200,
    health: 0,
    education: 0,
    bills: 100,
    other: 20,
  },
  {
    month: 'May',
    food: 135,
    transport: 48,
    shopping: 55,
    entertainment: 45,
    accommodation: 0,
    health: 30,
    education: 0,
    bills: 115,
    other: 18,
  },
  {
    month: 'June',
    food: 150,
    transport: 55,
    shopping: 65,
    entertainment: 60,
    accommodation: 0,
    health: 0,
    education: 0,
    bills: 120,
    other: 25,
  },
  {
    month: 'July',
    food: 160,
    transport: 60,
    shopping: 80,
    entertainment: 70,
    accommodation: 300,
    health: 15,
    education: 0,
    bills: 125,
    other: 30,
  },
  {
    month: 'August',
    food: 145,
    transport: 52,
    shopping: 75,
    entertainment: 55,
    accommodation: 0,
    health: 0,
    education: 500,
    bills: 110,
    other: 22,
  },
  {
    month: 'September',
    food: 155,
    transport: 58,
    shopping: 85,
    entertainment: 65,
    accommodation: 0,
    health: 25,
    education: 0,
    bills: 130,
    other: 28,
  },
  {
    month: 'October',
    food: 170,
    transport: 65,
    shopping: 90,
    entertainment: 80,
    accommodation: 0,
    health: 0,
    education: 0,
    bills: 140,
    other: 35,
  },
  {
    month: 'November',
    food: 165,
    transport: 62,
    shopping: 95,
    entertainment: 75,
    accommodation: 0,
    health: 35,
    education: 0,
    bills: 135,
    other: 32,
  },
  {
    month: 'December',
    food: 180,
    transport: 70,
    shopping: 100,
    entertainment: 90,
    accommodation: 0,
    health: 0,
    education: 0,
    bills: 150,
    other: 40,
  },
];

const chartConfig = {
  food: {
    label: 'Food',
    color: 'color-mix(in srgb, var(--color-orange-500) 60%, white)',
  },
  transport: {
    label: 'Transport',
    color: 'color-mix(in srgb, var(--color-sky-500) 60%, white)',
  },
  shopping: {
    label: 'Shopping',
    color: 'color-mix(in srgb, var(--color-emerald-500) 60%, white)',
  },
  entertainment: {
    label: 'Entertainment',
    color: 'color-mix(in srgb, var(--color-fuchsia-500) 60%, white)',
  },
  accommodation: {
    label: 'Accommodation',
    color: 'color-mix(in srgb, var(--color-amber-500) 60%, white)',
  },
  health: {
    label: 'Health',
    color: 'color-mix(in srgb, var(--color-red-500) 60%, white)',
  },
  education: {
    label: 'Education',
    color: 'color-mix(in srgb, var(--color-indigo-500) 60%, white)',
  },
  bills: {
    label: 'Bills',
    color: 'color-mix(in srgb, var(--color-cyan-500) 60%, white)',
  },
  other: {
    label: 'Other',
    color: 'color-mix(in srgb, var(--color-lime-500) 60%, white)',
  },
} satisfies ChartConfig;

export function MonthlyBarChart() {
  return (
    <Card className="mb-4 border-zinc-200/50 bg-zinc-50 py-4">
      <CardContent className="px-4">
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <rect
              x="0"
              y="0"
              width="100%"
              height="85%"
              fill="url(#default-multiple-pattern-dots)"
            />
            <defs>
              <DottedBackgroundPattern />
            </defs>
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  valueFormatter={humanizeNumber}
                />
              }
            />
            {Object.keys(chartConfig).map((key, index) => {
              const isLast = index === Object.keys(chartConfig).length - 1;
              const isFirst = index === 0;

              return (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={chartConfig[key as keyof typeof chartConfig].color}
                  stackId="a"
                  radius={
                    isFirst
                      ? [0, 0, 4, 4]
                      : isLast
                        ? [4, 4, 0, 0]
                        : [0, 0, 0, 0]
                  }
                  className="stroke-white stroke-1"
                />
              );
            })}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const DottedBackgroundPattern = () => {
  return (
    <pattern
      id="default-multiple-pattern-dots"
      x="0"
      y="0"
      width="10"
      height="10"
      patternUnits="userSpaceOnUse"
    >
      <circle
        className="text-zinc-400"
        cx="2"
        cy="2"
        r="1"
        fill="currentColor"
      />
    </pattern>
  );
};
