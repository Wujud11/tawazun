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
import {
  DEMO_DATA_DISCLAIMER_AR,
  enterpriseMonthlyTrend,
} from '@/data/enterprise-demo-scale'
import { formatAxisMillions } from '@/lib/format'

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
    <Card className="treasury-card">
      <CardHeader>
        <CardTitle>اتجاه المقاصة الشهري</CardTitle>
        <CardDescription>
          حجم محفظة مؤسسية تجريبية — {DEMO_DATA_DISCLAIMER_AR}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={[...enterpriseMonthlyTrend]}>
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
              tickFormatter={(v: number) => formatAxisMillions(v)}
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
