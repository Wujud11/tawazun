import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  TrendingUp,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { dashboardKpis } from '@/data/dashboard-mock'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

const iconMap = {
  'total-debts': TrendingUp,
  'active-companies': Building2,
  'saved-transfers': ArrowDownLeft,
} as const

const accentMap: Record<string, string> = {
  'total-debts': 'from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-900/50',
  'active-companies': 'from-violet-500/10 to-violet-600/5 border-violet-200/50 dark:border-violet-900/50',
  'saved-transfers': 'from-amber-500/10 to-amber-600/5 border-amber-200/50 dark:border-amber-900/50',
}

const iconColorMap: Record<string, string> = {
  'total-debts': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  'active-companies': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  'saved-transfers': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
}

export function KpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {dashboardKpis.map((kpi) => {
        const Icon = iconMap[kpi.id as keyof typeof iconMap] ?? TrendingUp
        const isPositive = kpi.change >= 0

        return (
          <Card
            key={kpi.id}
            className={cn(
              'treasury-card group bg-gradient-to-br transition-all duration-200 hover:-translate-y-0.5',
              accentMap[kpi.id],
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <div
                className={cn(
                  'rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-105',
                  iconColorMap[kpi.id],
                )}
              >
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight tabular-nums">
                {kpi.value}
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                {isPositive ? (
                  <ArrowUpRight className="size-3.5 text-emerald-600" />
                ) : (
                  <ArrowDownLeft className="size-3.5 text-red-500" />
                )}
                <span
                  className={cn(
                    'font-semibold tabular-nums',
                    isPositive ? 'text-emerald-600' : 'text-red-500',
                  )}
                >
                  {isPositive ? '+' : ''}
                  {formatPercent(kpi.change)}
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
