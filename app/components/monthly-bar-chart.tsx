import { Bar, BarChart, XAxis } from 'recharts';

import { Card, CardContent } from '~/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';
import type { ChartConfig } from '~/components/ui/chart';
import { humanizeNumber } from '~/lib/formatter';
import type { TransactionCategory } from '~/lib/transaction';

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

export type MonthlyChartData = {
  month: string;
} & {
  [key in TransactionCategory]: number;
};

type MonthlyBarChartProps = {
  data: MonthlyChartData[];
};

export function MonthlyBarChart(props: MonthlyBarChartProps) {
  const { data } = props;

  return (
    <Card className="border-zinc-200/50 bg-zinc-50 py-4">
      <CardContent className="px-4">
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
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
              isAnimationActive={false}
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
                  radius={4}
                  className="stroke-white stroke-1"
                  isAnimationActive={false}
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
        className="text-zinc-300"
        cx="2"
        cy="2"
        r="1"
        fill="currentColor"
      />
    </pattern>
  );
};
