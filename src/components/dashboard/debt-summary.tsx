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
import { debts } from '@/data/dashboard-mock'
import { formatSar } from '@/lib/format'
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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>ملخص الديون</CardTitle>
        <CardDescription>
          {debts.length.toLocaleString('ar-SA')} ديون نشطة — إجمالي{' '}
          {formatSar(total)}
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
                  {new Date(debt.dueDate).toLocaleDateString('ar-SA')}
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
