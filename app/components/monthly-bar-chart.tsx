'use client';

import { Bar, BarChart, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';
import type { ChartConfig } from '~/components/ui/chart';

const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
  { month: 'July', desktop: 120, mobile: 150 },
  { month: 'August', desktop: 19, mobile: 160 },
  { month: 'September', desktop: 130, mobile: 170 },
  { month: 'October', desktop: 214, mobile: 180 },
  { month: 'November', desktop: 140, mobile: 190 },
  { month: 'December', desktop: 140, mobile: 120 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'color-mix(in srgb, var(--color-blue-500) 60%, white)',
  },
  mobile: {
    label: 'Mobile',
    color: 'color-mix(in srgb, var(--color-rose-500) 60%, white)',
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
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="desktop"
              fill={chartConfig.desktop.color}
              stackId="a"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="mobile"
              fill={chartConfig.mobile.color}
              stackId="a"
              radius={[4, 4, 0, 0]}
            />
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
