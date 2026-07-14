import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Minus,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
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
import { companies } from '@/data/dashboard-mock'
import { formatNumber, formatSar } from '@/lib/format'
import { cn } from '@/lib/utils'
import { StatCardGrid, type StatCard } from '@/components/ui/stat-cards'
import type { Company } from '@/types/dashboard'

type CompanyStatus = 'creditor' | 'debtor' | 'balanced'

function getStatus(netBalance: number): CompanyStatus {
  if (netBalance > 0) return 'creditor'
  if (netBalance < 0) return 'debtor'
  return 'balanced'
}

const statusConfig: Record<
  CompanyStatus,
  { label: string; variant: 'success' | 'destructive' | 'secondary' }
> = {
  creditor: { label: 'دائن', variant: 'success' },
  debtor: { label: 'مدين', variant: 'destructive' },
  balanced: { label: 'متوازن', variant: 'secondary' },
}

const totalPayable = companies.reduce((s, c) => s + c.totalPayable, 0)
const totalReceivable = companies.reduce((s, c) => s + c.totalReceivable, 0)
const totalNet = companies.reduce((s, c) => s + c.netBalance, 0)

const summaryCards: StatCard[] = [
  {
    id: 'count',
    label: 'عدد الشركات',
    value: formatNumber(companies.length),
    sub: 'شركة في الشبكة',
    icon: Building2,
    colorClass: 'bg-primary/10 text-primary',
  },
  {
    id: 'payable',
    label: 'إجمالي المستحق الدفع',
    value: formatSar(totalPayable, true),
    sub: 'على جميع الشركات',
    icon: TrendingDown,
    colorClass: 'bg-red-500/10 text-red-600',
  },
  {
    id: 'receivable',
    label: 'إجمالي المستحق القبض',
    value: formatSar(totalReceivable, true),
    sub: 'لجميع الشركات',
    icon: TrendingUp,
    colorClass: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    id: 'net',
    label: 'الصافي الإجمالي للشبكة',
    value: formatSar(Math.abs(totalNet), true),
    sub: totalNet <= 0 ? 'صافي مدين' : 'صافي دائن',
    icon: Wallet,
    colorClass:
      totalNet < 0
        ? 'bg-amber-500/10 text-amber-600'
        : 'bg-emerald-500/10 text-emerald-600',
  },
]

function CompanyStatusBadge({ company }: { company: Company }) {
  const status = getStatus(company.netBalance)
  const { label, variant } = statusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}

function CompaniesTable({ rows }: { rows: Company[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <Building2 className="mb-3 size-10 opacity-30" />
        <p className="text-sm">لا توجد شركات تطابق البحث</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الشركة</TableHead>
          <TableHead>القطاع</TableHead>
          <TableHead>المستحق الدفع</TableHead>
          <TableHead>المستحق القبض</TableHead>
          <TableHead>الصافي</TableHead>
          <TableHead className="text-center">الديون النشطة</TableHead>
          <TableHead>الوضع</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((company) => {
          const isNet = company.netBalance >= 0
          return (
            <TableRow key={company.id}>
              <TableCell>
                <p className="font-medium">{company.name}</p>
                <p className="text-xs text-muted-foreground">{company.nameEn}</p>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{company.sector}</Badge>
              </TableCell>
              <TableCell className="font-mono tabular-nums text-red-600 dark:text-red-400">
                {company.totalPayable > 0 ? formatSar(company.totalPayable) : '—'}
              </TableCell>
              <TableCell className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {company.totalReceivable > 0
                  ? formatSar(company.totalReceivable)
                  : '—'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  {isNet ? (
                    <ArrowUpRight className="size-3.5 shrink-0 text-emerald-600" />
                  ) : (
                    <ArrowDownLeft className="size-3.5 shrink-0 text-red-500" />
                  )}
                  <span
                    className={cn(
                      'font-mono tabular-nums font-medium',
                      isNet
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400',
                    )}
                  >
                    {company.netBalance === 0
                      ? '—'
                      : formatSar(Math.abs(company.netBalance))}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className="tabular-nums">
                  {formatNumber(company.activeDebts)}
                </span>
              </TableCell>
              <TableCell>
                <CompanyStatusBadge company={company} />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export function CompaniesPage() {
  const [query, setQuery] = useState('')

  const filtered = companies.filter((c) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      c.name.includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.sector.includes(q)
    )
  })

  const creditors = companies.filter((c) => c.netBalance > 0).length
  const debtors = companies.filter((c) => c.netBalance < 0).length
  const balanced = companies.filter((c) => c.netBalance === 0).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">الشركات</h1>
        <p className="text-sm text-muted-foreground">
          إدارة ومتابعة جميع الشركات المشاركة في شبكة المقاصة
        </p>
      </div>

      <StatCardGrid cards={summaryCards} />

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>قائمة الشركات</CardTitle>
              <CardDescription className="mt-1">
                {formatNumber(companies.length)} شركة —&nbsp;
                <span className="text-emerald-600">{creditors} دائن</span>
                &nbsp;·&nbsp;
                <span className="text-red-600">{debtors} مدين</span>
                {balanced > 0 && (
                  <>
                    &nbsp;·&nbsp;
                    <span>{balanced} متوازن</span>
                  </>
                )}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم أو القطاع…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="ps-9"
              />
            </div>
          </div>

          {query && (
            <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
              <Minus className="size-3" />
              {formatNumber(filtered.length)} نتيجة من أصل{' '}
              {formatNumber(companies.length)}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <CompaniesTable rows={filtered} />
        </CardContent>
      </Card>
    </div>
  )
}
