import { ArrowLeftRight, Minus, TrendingDown } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  DEMO_DATA_DISCLAIMER_AR,
  enterprisePortfolioScale,
} from '@/data/enterprise-demo-scale'
import { formatNumber, formatPercent, formatSar } from '@/lib/format'

export function TransfersComparison() {
  const beforeCount = enterprisePortfolioScale.transfersBefore
  const afterCount = enterprisePortfolioScale.transfersAfter
  const beforeVolume = enterprisePortfolioScale.grossDebtSar
  const afterVolume = enterprisePortfolioScale.netSettlementSar
  const countReduction = enterprisePortfolioScale.transferReductionPct
  const volumeReduction = enterprisePortfolioScale.savingsPct
  const savedVolume = enterprisePortfolioScale.savingsSar

  return (
    <Card className="treasury-card h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="size-5 text-primary" />
          قبل vs بعد المقاصة
        </CardTitle>
        <CardDescription>
          أثر المقاصة على محفظة التحويلات — {DEMO_DATA_DISCLAIMER_AR}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">
              قبل المقاصة
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums">
              {formatNumber(beforeCount)}
            </p>
            <p className="text-sm text-muted-foreground">تحويل</p>
            <Separator className="my-3" />
            <p className="font-mono text-lg font-semibold tabular-nums">
              {formatSar(beforeVolume, true)}
            </p>
            <p className="text-xs text-muted-foreground">إجمالي الحجم</p>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">بعد المقاصة</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-primary">
              {formatNumber(afterCount)}
            </p>
            <p className="text-sm text-muted-foreground">تحويل</p>
            <Separator className="my-3" />
            <p className="font-mono text-lg font-semibold tabular-nums text-primary">
              {formatSar(afterVolume, true)}
            </p>
            <p className="text-xs text-muted-foreground">إجمالي الحجم</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="rounded-md bg-emerald-500/10 p-2">
              <TrendingDown className="size-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">تقليل التحويلات</p>
              <p className="font-bold tabular-nums">
                {formatPercent(countReduction)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="rounded-md bg-emerald-500/10 p-2">
              <Minus className="size-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">حجم موفر</p>
              <p className="font-bold tabular-nums">
                {formatSar(savedVolume, true)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="rounded-md bg-primary/10 p-2">
              <ArrowLeftRight className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">تخفيض الحجم</p>
              <p className="font-bold tabular-nums">
                {formatPercent(volumeReduction)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
