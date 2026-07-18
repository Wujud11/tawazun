import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  FileText,
  PiggyBank,
  Search,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatCardGrid, type StatCard } from '@/components/ui/stat-cards'
import {
  DEMO_DATA_DISCLAIMER_AR,
  SAMPLE_PARTICIPANTS_LABEL_AR,
  demoDebtCompanyNames,
  demoDebtLedger,
  demoPortfolio,
} from '@/data/demo-data'
import { formatDate, formatNumber, formatPercent, formatSar } from '@/lib/format'
import { cn } from '@/lib/utils'

type DebtLedgerStatus = (typeof demoDebtLedger)[number]['status']

const STATUS_OPTIONS: { value: 'all' | DebtLedgerStatus; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: 'معلق' },
  { value: 'overdue', label: 'متأخر' },
  { value: 'settled', label: 'مسوّى' },
]

const statusConfig: Record<
  DebtLedgerStatus,
  {
    label: string
    variant: 'warning' | 'destructive' | 'success'
    icon: typeof Clock
  }
> = {
  pending: { label: 'معلق', variant: 'warning', icon: Clock },
  overdue: { label: 'متأخر', variant: 'destructive', icon: AlertCircle },
  settled: { label: 'مسوّى', variant: 'success', icon: CheckCircle2 },
}

const kpiCards: StatCard[] = [
  {
    id: 'total-value',
    label: 'إجمالي قيمة الديون',
    value: formatSar(demoPortfolio.grossDebtSar, true),
    sub: DEMO_DATA_DISCLAIMER_AR,
    icon: TrendingUp,
    colorClass: 'bg-primary/10 text-primary',
  },
  {
    id: 'before',
    label: 'التحويلات قبل المقاصة',
    value: formatNumber(demoPortfolio.transfersBefore),
    sub: `${formatNumber(demoPortfolio.financialRelationships)} علاقة مالية`,
    icon: ArrowLeftRight,
    colorClass: 'bg-red-500/10 text-red-600',
  },
  {
    id: 'after',
    label: 'التحويلات بعد المقاصة',
    value: formatNumber(demoPortfolio.transfersAfter),
    sub: `${formatNumber(demoPortfolio.transfersBefore)} → ${formatNumber(demoPortfolio.transfersAfter)}`,
    icon: FileText,
    colorClass: 'bg-blue-500/10 text-blue-600',
  },
  {
    id: 'savings',
    label: 'السيولة المحررة',
    value: formatSar(demoPortfolio.savingsSar, true),
    sub: formatPercent(demoPortfolio.savingsPct),
    icon: PiggyBank,
    colorClass: 'bg-emerald-500/10 text-emerald-600',
  },
]

function DebtStatusBadge({ status }: { status: DebtLedgerStatus }) {
  const { label, variant, icon: Icon } = statusConfig[status]
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <FileText className="mb-3 size-10 opacity-30" />
      <p className="text-sm font-medium">لا توجد سجلات تطابق الفلاتر المحددة</p>
      <p className="mt-1 text-xs">جرب تغيير البحث أو الفلاتر</p>
    </div>
  )
}

function DebtTable({ rows }: { rows: typeof demoDebtLedger }) {
  if (rows.length === 0) return <EmptyState />
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>الدائن</TableHead>
          <TableHead>المدين</TableHead>
          <TableHead>المبلغ</TableHead>
          <TableHead>العملة</TableHead>
          <TableHead>تاريخ الاستحقاق</TableHead>
          <TableHead>الحالة</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((debt, index) => (
          <TableRow key={debt.id}>
            <TableCell className="text-xs text-muted-foreground tabular-nums">
              {formatNumber(index + 1)}
            </TableCell>
            <TableCell>
              <span className="font-medium">{debt.creditor}</span>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {debt.debtor}
            </TableCell>
            <TableCell className="font-mono tabular-nums font-semibold">
              {formatSar(debt.amount)}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-mono text-xs">
                {debt.currency}
              </Badge>
            </TableCell>
            <TableCell>
              <span
                className={cn(
                  'text-sm tabular-nums',
                  debt.status === 'overdue'
                    ? 'font-medium text-red-600 dark:text-red-400'
                    : 'text-muted-foreground',
                )}
              >
                {formatDate(debt.dueDate, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </TableCell>
            <TableCell>
              <DebtStatusBadge status={debt.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function DebtsPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | DebtLedgerStatus>(
    'all',
  )
  const [companyFilter, setCompanyFilter] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return demoDebtLedger.filter((d) => {
      const matchesSearch =
        !q ||
        d.creditor.includes(q) ||
        d.debtor.includes(q) ||
        d.creditor.toLowerCase().includes(q) ||
        d.debtor.toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'all' || d.status === statusFilter

      const matchesCompany =
        companyFilter === 'all' ||
        d.creditor === companyFilter ||
        d.debtor === companyFilter

      return matchesSearch && matchesStatus && matchesCompany
    })
  }, [query, statusFilter, companyFilter])

  const pendingCount = demoDebtLedger.filter((d) => d.status === 'pending').length
  const overdueCount = demoDebtLedger.filter((d) => d.status === 'overdue').length
  const settledCount = demoDebtLedger.filter((d) => d.status === 'settled').length

  const isFiltered =
    query.trim() !== '' || statusFilter !== 'all' || companyFilter !== 'all'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">الديون</h1>
        <p className="text-sm text-muted-foreground">
          محفظة {formatNumber(demoPortfolio.participatingCompanies)} شركة — مؤشرات
          من مصدر العرض الموحّد · الجدول {SAMPLE_PARTICIPANTS_LABEL_AR}
          &nbsp;·&nbsp;
          <span className="text-amber-600">{pendingCount} معلق</span>
          &nbsp;·&nbsp;
          <span className="text-red-600">{overdueCount} متأخر</span>
          &nbsp;·&nbsp;
          <span className="text-emerald-600">{settledCount} مسوّى</span>
        </p>
      </div>

      <StatCardGrid cards={kpiCards} />

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle>{SAMPLE_PARTICIPANTS_LABEL_AR}</CardTitle>
              <CardDescription>
                {isFiltered
                  ? `${formatNumber(filtered.length)} نتيجة من أصل ${formatNumber(demoDebtLedger.length)}`
                  : `${formatNumber(demoDebtLedger.length)} سجلات عيّنة — إجمالي المحفظة ${formatSar(demoPortfolio.grossDebtSar, true)}`}
              </CardDescription>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ابحث بالدائن أو المدين…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="ps-9"
                />
              </div>

              <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
                {STATUS_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    size="sm"
                    variant={statusFilter === opt.value ? 'default' : 'ghost'}
                    className={cn(
                      'h-7 rounded-md px-3 text-xs',
                      statusFilter !== opt.value &&
                        'text-muted-foreground hover:text-foreground',
                    )}
                    onClick={() => setStatusFilter(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>

              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">جميع الشركات</option>
                {demoDebtCompanyNames.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <DebtTable rows={filtered} />
        </CardContent>
      </Card>
    </div>
  )
}
