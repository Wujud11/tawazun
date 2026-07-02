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
import { companyDebtShares } from '@/data/dashboard-mock'

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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>توزيع الديون حسب الشركة</CardTitle>
        <CardDescription>
          مقارنة المبالغ المستحقة الدفع والقبض
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ChartContainer config={chartConfig} className="h-[260px] w-full sm:h-[280px]">
          <BarChart data={companyDebtShares} barGap={4}>
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
              tickFormatter={(v: number) =>
                `${(v / 1000).toLocaleString('ar-SA')}K`
              }
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
