import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { demoRecentDebts as debts } from '@/data/demo-data'
import { formatDate, formatNumber, formatSar } from '@/lib/format'
import type { DebtStatus } from '@/types/dashboard'

const statusLabels: Record<DebtStatus, string> = {
  pending: 'معلق',
  partial: 'جزئي',
  netted: 'تمت المقاصة',
}

const statusVariants: Record<
  DebtStatus,
  'warning' | 'secondary' | 'success'
> = {
  pending: 'warning',
  partial: 'secondary',
  netted: 'success',
}

export function DebtSummary() {
  const total = debts.reduce((sum, debt) => sum + debt.amount, 0)

  return (
    <Card className="treasury-card">
      <CardHeader>
        <CardTitle>ملخص الديون</CardTitle>
        <CardDescription>
          عينة تفصيلية للتشغيل — {formatNumber(debts.length)} سجلات معروضة من
          محفظة أوسع (إجمالي العينة {formatSar(total)})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المدين</TableHead>
              <TableHead>الدائن</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>الاستحقاق</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.map((debt) => (
              <TableRow key={debt.id}>
                <TableCell className="font-medium">{debt.from}</TableCell>
                <TableCell>{debt.to}</TableCell>
                <TableCell className="font-mono tabular-nums">
                  {formatSar(debt.amount)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(debt.dueDate)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariants[debt.status]}>
                    {statusLabels[debt.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
