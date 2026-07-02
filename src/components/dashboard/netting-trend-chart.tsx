import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart'
import { monthlyTrend } from '@/data/dashboard-mock'

const chartConfig = {
  grossVolume: {
    label: 'الحجم الإجمالي',
    color: 'var(--chart-3)',
  },
  nettedVolume: {
    label: 'بعد المقاصة',
    color: 'var(--chart-1)',
  },
  savings: {
    label: 'التوفير',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function NettingTrendChart() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>اتجاه المقاصة الشهري</CardTitle>
        <CardDescription>
          الحجم الإجمالي مقابل الحجم بعد المقاصة والتوفير
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer config={chartConfig} className="h-[260px] w-full sm:h-[280px]">
          <AreaChart data={monthlyTrend}>
            <defs>
              <linearGradient id="fillNetted" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-nettedVolume)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-nettedVolume)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="fillSavings" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-savings)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-savings)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                `${(v / 1_000_000).toLocaleString('ar-SA')}M`
              }
            />
            <ChartTooltip />
            <Area
              type="monotone"
              dataKey="grossVolume"
              stroke="var(--color-grossVolume)"
              fill="transparent"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
            <Area
              type="monotone"
              dataKey="nettedVolume"
              stroke="var(--color-nettedVolume)"
              fill="url(#fillNetted)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="savings"
              stroke="var(--color-savings)"
              fill="url(#fillSavings)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
