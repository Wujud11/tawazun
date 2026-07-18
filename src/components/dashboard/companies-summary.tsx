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
import {
  SAMPLE_PARTICIPANT_COUNT,
  SAMPLE_PARTICIPANTS_LABEL_AR,
  demoPortfolio,
  demoSampleCompanies,
} from '@/data/demo-data'
import { formatNumber, formatSar } from '@/lib/format'
import { cn } from '@/lib/utils'

export function CompaniesSummary() {
  return (
    <Card className="treasury-card">
      <CardHeader>
        <CardTitle>{SAMPLE_PARTICIPANTS_LABEL_AR}</CardTitle>
        <CardDescription>
          Sample Participants — {formatNumber(SAMPLE_PARTICIPANT_COUNT)} من أصل{' '}
          {formatNumber(demoPortfolio.participatingCompanies)} شركة في المحفظة
          التجريبية
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الشركة</TableHead>
              <TableHead>القطاع</TableHead>
              <TableHead>مستحق الدفع</TableHead>
              <TableHead>مستحق القبض</TableHead>
              <TableHead>الصافي</TableHead>
              <TableHead>الديون</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoSampleCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <div className="font-medium">{company.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {company.nameEn}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{company.sector}</Badge>
                </TableCell>
                <TableCell className="font-mono tabular-nums text-red-600 dark:text-red-400">
                  {formatSar(company.totalPayable)}
                </TableCell>
                <TableCell className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatSar(company.totalReceivable)}
                </TableCell>
                <TableCell
                  className={cn(
                    'font-mono tabular-nums font-medium',
                    company.netBalance < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400',
                  )}
                >
                  {company.netBalance < 0 ? '−' : '+'}
                  {formatSar(Math.abs(company.netBalance))}
                </TableCell>
                <TableCell className="text-center">
                  {formatNumber(company.activeDebts)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
