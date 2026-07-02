import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { dashboardKpis } from '@/data/dashboard-mock'
import { cn } from '@/lib/utils'

const iconMap = {
  'total-debts': TrendingUp,
  'active-companies': Building2,
  'netting-efficiency': Sparkles,
  'saved-transfers': ArrowDownLeft,
} as const

export function KpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {dashboardKpis.map((kpi) => {
        const Icon = iconMap[kpi.id as keyof typeof iconMap] ?? TrendingUp
        const isPositive = kpi.change >= 0

        return (
          <Card key={kpi.id} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {kpi.id === 'total-debts' ? (
                  <>
                    {kpi.value}
                    <span className="ms-1 text-sm font-normal text-muted-foreground">
                      ر.س
                    </span>
                  </>
                ) : (
                  kpi.value
                )}
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                {isPositive ? (
                  <ArrowUpRight className="size-3.5 text-emerald-600" />
                ) : (
                  <ArrowDownLeft className="size-3.5 text-red-500" />
                )}
                <span
                  className={cn(
                    'font-medium',
                    isPositive ? 'text-emerald-600' : 'text-red-500',
                  )}
                >
                  {isPositive ? '+' : ''}
                  {kpi.change.toLocaleString('ar-SA')}%
                </span>
                <span className="text-muted-foreground">{kpi.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
