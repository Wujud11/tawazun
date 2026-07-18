import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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
  enterpriseCompanyDebtShares,
} from '@/data/enterprise-demo-scale'
import { formatAxisThousands } from '@/lib/format'

const chartConfig = {
  payable: {
    label: 'مستحق الدفع',
    color: 'var(--chart-1)',
  },
  receivable: {
    label: 'مستحق القبض',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function CompanyDebtChart() {
  return (
    <Card className="treasury-card">
      <CardHeader>
        <CardTitle>توزيع الديون حسب الشركة</CardTitle>
        <CardDescription>
          عينة من أكبر المراكز في الشبكة — {DEMO_DATA_DISCLAIMER_AR}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={[...enterpriseCompanyDebtShares]} barGap={4}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="company"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatAxisThousands(v)}
            />
            <ChartTooltip />
            <Bar
              dataKey="payable"
              fill="var(--color-payable)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="receivable"
              fill="var(--color-receivable)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
