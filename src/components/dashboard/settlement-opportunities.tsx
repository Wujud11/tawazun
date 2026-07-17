import { ArrowRight, Building2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { settlementOpportunities } from '@/data/workflow-mock'
import { formatNumber, formatPercent, formatSar } from '@/lib/format'
import { cn } from '@/lib/utils'

const statusLabel: Record<
  (typeof settlementOpportunities)[number]['status'],
  string
> = {
  detected: 'مكتشفة',
  in_review: 'قيد المراجعة',
  awaiting_approvals: 'بانتظار الموافقات',
  ready: 'جاهزة للتنفيذ',
  completed: 'مكتملة',
}

const statusVariant: Record<
  (typeof settlementOpportunities)[number]['status'],
  'warning' | 'secondary' | 'default' | 'success' | 'outline'
> = {
  detected: 'warning',
  in_review: 'secondary',
  awaiting_approvals: 'default',
  ready: 'success',
  completed: 'outline',
}

export function SettlementOpportunities() {
  return (
    <Card className="treasury-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            فرص التسوية
          </CardTitle>
          <CardDescription className="mt-1">
            فرص مقاصة متعددة الأطراف جاهزة للمراجعة والتنفيذ
          </CardDescription>
        </div>
        <Badge variant="secondary" className="w-fit">
          {formatNumber(settlementOpportunities.length)} فرص
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {settlementOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className={cn(
              'rounded-xl border p-4 transition-colors hover:bg-muted/30',
              opportunity.status === 'detected' &&
                'border-primary/25 bg-primary/[0.03]',
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{opportunity.title}</p>
                  <Badge variant={statusVariant[opportunity.status]}>
                    {statusLabel[opportunity.status]}
                  </Badge>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {opportunity.summary}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="size-3.5" />
                    {formatNumber(opportunity.companyCount)} شركات
                  </span>
                  <span>
                    قبل {formatNumber(opportunity.transfersBefore)} → بعد{' '}
                    {formatNumber(opportunity.transfersAfter)}
                  </span>
                  <span className="font-medium text-emerald-600">
                    توفير {formatSar(opportunity.savings, true)} (
                    {formatPercent(opportunity.savingsPct)})
                  </span>
                </div>
              </div>
              <Button asChild size="sm" className="shrink-0 gap-1.5">
                <Link
                  to={`/netting?workflow=1&step=opportunity&id=${opportunity.id}`}
                >
                  مراجعة
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Metric
                label="الإجمالي"
                value={formatSar(opportunity.grossAmount, true)}
              />
              <Metric
                label="الصافي"
                value={formatSar(opportunity.netAmount, true)}
                accent
              />
              <Metric
                label="قبل"
                value={formatNumber(opportunity.transfersBefore)}
              />
              <Metric
                label="بعد"
                value={formatNumber(opportunity.transfersAfter)}
                accent
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-0.5 font-mono text-sm font-semibold tabular-nums',
          accent && 'text-primary',
        )}
      >
        {value}
      </p>
    </div>
  )
}
