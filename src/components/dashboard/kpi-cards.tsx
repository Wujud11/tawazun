import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  PiggyBank,
  Scale,
  TrendingUp,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DEMO_DATA_DISCLAIMER_AR,
  enterprisePortfolioScale,
} from '@/data/enterprise-demo-scale'
import { formatNumber, formatPercent, formatSar } from '@/lib/format'
import { cn } from '@/lib/utils'

const presentationKpis = [
  {
    id: 'companies',
    label: 'الشركات المشاركة',
    value: formatNumber(enterprisePortfolioScale.participatingCompanies),
    change: 11.2,
    changeLabel: 'في شبكة التسوية التجريبية',
    icon: Building2,
    accent:
      'from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-900/50',
    iconColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  {
    id: 'gross',
    label: 'إجمالي الديون',
    value: formatSar(enterprisePortfolioScale.grossDebtSar),
    change: 9.6,
    changeLabel: 'الحجم قبل المقاصة',
    icon: TrendingUp,
    accent:
      'from-rose-500/10 to-rose-600/5 border-rose-200/50 dark:border-rose-900/50',
    iconColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  },
  {
    id: 'net',
    label: 'صافي التسوية',
    value: formatSar(enterprisePortfolioScale.netSettlementSar),
    change: enterprisePortfolioScale.transferReductionPct,
    changeLabel: 'تخفيض عدد التحويلات',
    icon: Scale,
    accent:
      'from-sky-500/10 to-sky-600/5 border-sky-200/50 dark:border-sky-900/50',
    iconColor: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  },
  {
    id: 'savings',
    label: 'التوفير المتوقع',
    value: formatSar(enterprisePortfolioScale.savingsSar),
    change: enterprisePortfolioScale.savingsPct,
    changeLabel: 'تخفيض في حجم التحويلات',
    icon: PiggyBank,
    accent:
      'from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 dark:border-emerald-900/50',
    iconColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
] as const

export function KpiCards() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {formatNumber(enterprisePortfolioScale.financialRelationships)} علاقة
          مالية · {formatNumber(enterprisePortfolioScale.transfersBefore)} تحويل
          قبل المقاصة · {formatNumber(enterprisePortfolioScale.transfersAfter)}{' '}
          بعد المقاصة
        </p>
        <span className="rounded-md border bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground">
          {DEMO_DATA_DISCLAIMER_AR}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {presentationKpis.map((kpi) => {
          const Icon = kpi.icon
          const isPositive = kpi.change >= 0

          return (
            <Card
              key={kpi.id}
              className={cn(
                'treasury-card group bg-gradient-to-br transition-all duration-200 hover:-translate-y-0.5',
                kpi.accent,
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <div
                  className={cn(
                    'rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-105',
                    kpi.iconColor,
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
                    {formatPercent(Math.abs(kpi.change))}
                  </span>
                  <span className="text-muted-foreground">{kpi.changeLabel}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
