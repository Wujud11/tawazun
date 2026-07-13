import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Minus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { companies } from '@/data/dashboard-mock'
import { debtRecords } from '@/data/debts-mock'
import { formatSar } from '@/lib/format'
import { cn } from '@/lib/utils'
import { StatCardGrid, type StatCard } from '@/components/ui/stat-cards'

// ─── Types ────────────────────────────────────────────────────────────────────

type TxItem = { id: string; from: string; to: string; amount: number }

type NettingOpportunity = {
  companies: string[]
  netAmount: number
  direction: string
  savings: number
  recommendation: string
}

type RiskFlag = {
  companyName: string
  risk: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

type NettingAnalysisResult = {
  summary: string
  metrics: {
    totalGrossVolume: number
    totalNetVolume: number
    estimatedSavings: number
    efficiencyPct: number
    recommendedTransactions: number
    overdueCount: number
    overdueVolume: number
  }
  nettingOpportunities: NettingOpportunity[]
  riskFlags: RiskFlag[]
  insights: string[]
}

type DialogProps = {
  open: boolean
  onClose: () => void
  analysis: NettingAnalysisResult | null
  apiError: string | null
  countBefore: number
}

// ─── "Before" state — derived from debtRecords, no API required ───────────────

const activeRecords = debtRecords.filter((r) => r.status !== 'settled')

const beforeTxs: TxItem[] = activeRecords.map((r) => ({
  id: r.id,
  from: r.debtor,
  to: r.creditor,
  amount: r.amount,
}))

const grossVolume = activeRecords.reduce((s, r) => s + r.amount, 0)
const countBefore = activeRecords.length

// ─── TxRow ────────────────────────────────────────────────────────────────────

function TxRow({
  tx,
  variant = 'neutral',
  recommendation,
}: {
  tx: TxItem
  variant?: 'neutral' | 'success'
  recommendation?: string
}) {
  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition-colors',
          variant === 'success'
            ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30'
            : 'bg-muted/30',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate font-medium">{tx.from}</span>
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-muted-foreground">{tx.to}</span>
        </div>
        <span
          className={cn(
            'shrink-0 font-mono text-sm font-semibold tabular-nums',
            variant === 'success'
              ? 'text-emerald-700 dark:text-emerald-400'
              : '',
          )}
        >
          {formatSar(tx.amount, true)}
        </span>
      </div>
      {recommendation && (
        <p className="px-1 text-xs text-muted-foreground">{recommendation}</p>
      )}
    </div>
  )
}

// ─── NettingResultDialog ──────────────────────────────────────────────────────

function NettingResultDialog({
  open,
  onClose,
  analysis,
  apiError,
  countBefore: before,
}: DialogProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const afterTxs: TxItem[] = (analysis?.nettingOpportunities ?? []).map(
    (op, i) => ({
      id: `n${i + 1}`,
      from: op.companies[0] ?? '',
      to: op.companies[1] ?? '',
      amount: op.netAmount,
    }),
  )

  const countAfter = analysis?.metrics.recommendedTransactions ?? 0
  const savedTransfers = before - countAfter
  const volumeSaved = analysis?.metrics.estimatedSavings ?? 0
  const efficiencyPct = analysis?.metrics.efficiencyPct ?? 0
  const volumeAfter = analysis?.metrics.totalNetVolume ?? 0

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-2xl">
          {/* Header */}
          <CardHeader className="pb-4 text-center">
            <div
              className={cn(
                'mx-auto mb-3 flex size-14 items-center justify-center rounded-full',
                apiError
                  ? 'bg-red-100 dark:bg-red-950'
                  : 'bg-emerald-100 dark:bg-emerald-950',
              )}
            >
              {apiError ? (
                <AlertTriangle className="size-7 text-red-600" />
              ) : (
                <CheckCircle2 className="size-7 text-emerald-600" />
              )}
            </div>
            <CardTitle className="text-xl">
              {apiError ? 'فشل تحليل المقاصة' : 'اكتملت عملية المقاصة'}
            </CardTitle>
            <CardDescription>
              {apiError
                ? apiError
                : (analysis?.summary ?? 'تم حساب التحويلات المقترحة بعد تنفيذ المقاصة')}
            </CardDescription>
          </CardHeader>

          {!apiError && analysis && (
            <CardContent className="space-y-5">
              {/* Stats strip */}
              <div className="grid grid-cols-3 divide-x divide-x-reverse divide-border rounded-lg border bg-muted/30 text-center">
                <div className="px-3 py-3">
                  <p className="text-2xl font-bold tabular-nums text-emerald-600">
                    {savedTransfers.toLocaleString('ar-SA')}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    تحويلات محذوفة
                  </p>
                </div>
                <div className="px-3 py-3">
                  <p className="text-2xl font-bold tabular-nums text-primary">
                    {formatSar(volumeSaved, true)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    حجم موفّر
                  </p>
                </div>
                <div className="px-3 py-3">
                  <p className="text-2xl font-bold tabular-nums">
                    {efficiencyPct.toLocaleString('ar-SA')}%
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    تخفيض الحجم
                  </p>
                </div>
              </div>

              <Separator />

              {/* Resulting transactions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">التحويلات بعد المقاصة</p>
                  <Badge variant="success">
                    {countAfter.toLocaleString('ar-SA')} تحويلات
                  </Badge>
                </div>
                <div className="space-y-2">
                  {afterTxs.map((tx) => (
                    <TxRow key={tx.id} tx={tx} variant="success" />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Footer */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  المبلغ المتبقي للتحويل:{' '}
                  <span className="font-mono font-medium text-foreground">
                    {formatSar(volumeAfter, true)}
                  </span>
                </p>
                <Button onClick={onClose} size="sm">
                  حسناً
                </Button>
              </div>
            </CardContent>
          )}

          {(apiError || !analysis) && (
            <CardContent>
              <div className="flex justify-center pb-2">
                <Button onClick={onClose} size="sm">
                  إغلاق
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>,
    document.body,
  )
}

// ─── BeforePanel ──────────────────────────────────────────────────────────────

function BeforePanel() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-400">
                ق
              </span>
              قبل المقاصة
            </CardTitle>
            <CardDescription className="mt-1">
              الحالة الراهنة للشبكة
            </CardDescription>
          </div>
          <div className="text-end">
            <p className="text-lg font-bold tabular-nums text-red-600">
              {countBefore.toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-muted-foreground">تحويل</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {beforeTxs.map((tx) => (
          <TxRow key={tx.id} tx={tx} variant="neutral" />
        ))}
        <div className="flex items-center justify-between rounded-lg border border-dashed p-3 text-sm">
          <span className="text-muted-foreground">الإجمالي</span>
          <span className="font-mono font-bold tabular-nums">
            {formatSar(grossVolume, true)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── AfterPanel ───────────────────────────────────────────────────────────────

function AfterPanel({
  done,
  analysis,
}: {
  done: boolean
  analysis: NettingAnalysisResult | null
}) {
  const afterTxs: TxItem[] = (analysis?.nettingOpportunities ?? []).map(
    (op, i) => ({
      id: `n${i + 1}`,
      from: op.companies[0] ?? '',
      to: op.companies[1] ?? '',
      amount: op.netAmount,
    }),
  )

  const volumeAfter = analysis?.metrics.totalNetVolume ?? 0
  const volumeSaved = analysis?.metrics.estimatedSavings ?? 0
  const efficiencyPct = analysis?.metrics.efficiencyPct ?? 0
  const countAfter = analysis?.metrics.recommendedTransactions ?? 0

  return (
    <Card
      className={cn(
        'shadow-sm transition-opacity duration-300',
        !done && 'opacity-60',
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                ب
              </span>
              بعد المقاصة
            </CardTitle>
            <CardDescription className="mt-1">
              الشبكة بعد تنفيذ المقاصة
            </CardDescription>
          </div>
          {done && analysis && (
            <div className="text-end">
              <p className="text-lg font-bold tabular-nums text-emerald-600">
                {countAfter.toLocaleString('ar-SA')}
              </p>
              <p className="text-xs text-muted-foreground">تحويل</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {done && analysis ? (
          <div className="space-y-2">
            {afterTxs.map((tx, i) => (
              <TxRow
                key={tx.id}
                tx={tx}
                variant="success"
                recommendation={analysis.nettingOpportunities[i]?.recommendation}
              />
            ))}
            <div className="flex items-center justify-between rounded-lg border border-dashed border-emerald-300 p-3 text-sm dark:border-emerald-800">
              <span className="text-muted-foreground">الإجمالي</span>
              <span className="font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatSar(volumeAfter, true)}
              </span>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/40">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  وُفِّر {formatSar(volumeSaved, true)} —{' '}
                  {efficiencyPct.toLocaleString('ar-SA')}% تخفيض في الحجم
                </span>
              </div>
            </div>
          </div>
        ) : done ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <p className="text-sm text-muted-foreground">
              تعذّر جلب نتائج المقاصة
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="mb-4 rounded-full border-2 border-dashed border-border p-5">
              <Sparkles className="size-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              في انتظار تشغيل المقاصة
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              اضغط "تشغيل المقاصة" لرؤية النتائج
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── AiInsightsSection ────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<RiskFlag['severity'], string> = {
  high: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30',
  medium:
    'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30',
  low: 'border-border bg-muted/30',
}

const SEVERITY_BADGE: Record<RiskFlag['severity'], string> = {
  high: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950',
  medium: 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-950',
  low: 'text-muted-foreground bg-muted',
}

const SEVERITY_LABEL: Record<RiskFlag['severity'], string> = {
  high: 'عالي',
  medium: 'متوسط',
  low: 'منخفض',
}

function AiInsightsSection({ analysis }: { analysis: NettingAnalysisResult }) {
  return (
    <div className="space-y-4">
      {/* Risk flags */}
      {analysis.riskFlags.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-500" />
              مؤشرات المخاطر
            </CardTitle>
            <CardDescription>
              {analysis.riskFlags.length} شركة تستدعي المتابعة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.riskFlags.map((flag, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm',
                  SEVERITY_STYLES[flag.severity],
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{flag.companyName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {flag.description}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                    SEVERITY_BADGE[flag.severity],
                  )}
                >
                  {SEVERITY_LABEL[flag.severity]}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="size-4 text-primary" />
              توصيات الذكاء الاصطناعي
            </CardTitle>
            <CardDescription>تحليل مدعوم بـ GPT-4o</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.insights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border bg-muted/30 px-4 py-3 text-sm"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <p>{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── NettingPage ──────────────────────────────────────────────────────────────

export function NettingPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [nettingDone, setNettingDone] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [analysis, setAnalysis] = useState<NettingAnalysisResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const countAfter = analysis?.metrics.recommendedTransactions ?? 0
  const countReductionPct =
    countBefore > 0 ? Math.round((1 - countAfter / countBefore) * 100) : 0

  const kpiCards: StatCard[] = [
    {
      id: 'before',
      label: 'التحويلات قبل المقاصة',
      value: countBefore.toLocaleString('ar-SA'),
      sub: 'تحويل في الشبكة',
      icon: TrendingUp,
      colorClass: 'bg-red-500/10 text-red-600',
    },
    {
      id: 'after',
      label: 'التحويلات بعد المقاصة',
      value: analysis ? countAfter.toLocaleString('ar-SA') : '—',
      sub: 'تحويل بعد المقاصة',
      icon: TrendingDown,
      colorClass: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      id: 'reduction',
      label: 'نسبة التخفيض',
      value: analysis ? `${countReductionPct.toLocaleString('ar-SA')}%` : '—',
      sub: 'تقليل في عدد التحويلات',
      icon: Minus,
      colorClass: 'bg-primary/10 text-primary',
    },
    {
      id: 'total',
      label: 'إجمالي قيمة الديون',
      value: formatSar(grossVolume, true),
      sub: 'قبل تطبيق المقاصة',
      icon: Zap,
      colorClass: 'bg-amber-500/10 text-amber-600',
    },
  ]

  async function handleRunNetting() {
    if (isRunning || nettingDone) return
    setIsRunning(true)
    setApiError(null)

    try {
      const res = await fetch('/api/ai/netting-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companies, debtRecords }),
      })

      if (res.ok) {
        const data = (await res.json()) as {
          success: boolean
          analysis: NettingAnalysisResult
        }
        setAnalysis(data.analysis)
      } else {
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string
        }
        const msg = payload.error ?? `فشل الطلب (${res.status})`
        setApiError(msg)
        console.error('[netting] API error', res.status, payload)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error'
      setApiError(msg)
      console.error('[netting] fetch failed', err)
    } finally {
      setIsRunning(false)
      setNettingDone(true)
      setDialogOpen(true)
    }
  }

  function handleReset() {
    setNettingDone(false)
    setDialogOpen(false)
    setAnalysis(null)
    setApiError(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المقاصة الذكية</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تطبيق خوارزمية المقاصة متعددة الأطراف لتقليل عدد التحويلات مع
            الحفاظ على صافي الالتزامات
          </p>
        </div>

        <div className="flex items-center gap-2">
          {nettingDone && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              إعادة التعيين
            </Button>
          )}
          <Button
            onClick={handleRunNetting}
            disabled={isRunning || nettingDone}
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جارٍ التحليل…
              </>
            ) : nettingDone ? (
              <>
                <CheckCircle2 className="size-4" />
                تمّت المقاصة
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                تشغيل المقاصة
              </>
            )}
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <StatCardGrid cards={kpiCards} />

      {/* Before / After panels */}
      <div className="grid gap-6 xl:grid-cols-2">
        <BeforePanel />
        <AfterPanel done={nettingDone} analysis={analysis} />
      </div>

      {/* AI risk flags + insights — only visible after a successful analysis */}
      {nettingDone && analysis && <AiInsightsSection analysis={analysis} />}

      {/* Result dialog */}
      <NettingResultDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        analysis={analysis}
        apiError={apiError}
        countBefore={countBefore}
      />
    </div>
  )
}
