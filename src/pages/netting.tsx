import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  GitBranch,
  Lightbulb,
  Loader2,
  Minus,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useState, type ElementType, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'

import { SettlementWorkflow } from '@/components/netting/settlement-workflow'
import { EnterpriseNettingSessionPanel } from '@/components/netting/enterprise-session-panel'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  PRIMARY_OPPORTUNITY_ID,
  demoAfterTransferSample,
  demoBeforeTransferSample,
  demoCompanies,
  demoNetTransfers,
  demoPortfolio,
  demoSampleCompanies as sampleCompanies,
} from '@/data/demo-data'
import { formatNumber, formatPercent, formatSar } from '@/lib/format'
import { cn } from '@/lib/utils'
import { StatCardGrid, type StatCard } from '@/components/ui/stat-cards'
import { API_BASE } from '@/lib/api'
import type { WorkflowStepId } from '@/types/workflow'

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
  grossVolume: number
}

// ─── KPIs + transfer samples — all from computeNetting on the enterprise dataset ─

const portfolioGross = demoPortfolio.grossDebtSar
const portfolioCountBefore = demoPortfolio.transfersBefore
const portfolioCountAfter = demoPortfolio.transfersAfter
const portfolioSavings = demoPortfolio.savingsSar
const portfolioNet = demoPortfolio.netSettlementSar
const portfolioSavingsPct = demoPortfolio.savingsPct

const beforeTxs: TxItem[] = demoBeforeTransferSample.map((t) => ({
  id: t.id,
  from: t.from,
  to: t.to,
  amount: t.amount,
}))

/** Local analysis from precomputed computeNetting() — numbers never depend on AI. */
function buildLocalAnalysis(): NettingAnalysisResult {
  return {
    summary: `تحليل محفظة مؤسسية: ${formatNumber(demoPortfolio.participatingCompanies)} شركة و${formatNumber(demoPortfolio.financialRelationships)} علاقة مالية. خوارزمية المقاصة خفّضت التحويلات من ${formatNumber(portfolioCountBefore)} إلى ${formatNumber(portfolioCountAfter)} وحجماً من ${formatSar(portfolioGross, true)} إلى ${formatSar(portfolioNet, true)} (توفير ${formatPercent(portfolioSavingsPct)}).`,
    metrics: {
      totalGrossVolume: portfolioGross,
      totalNetVolume: portfolioNet,
      estimatedSavings: portfolioSavings,
      efficiencyPct: portfolioSavingsPct,
      recommendedTransactions: portfolioCountAfter,
      overdueCount: demoPortfolio.overdueCount,
      overdueVolume: demoPortfolio.overdueVolumeSar,
    },
    nettingOpportunities: demoNetTransfers.map((tx) => ({
      companies: [tx.from, tx.to],
      netAmount: tx.amount,
      direction: `${tx.from} → ${tx.to}`,
      savings: tx.bilateralSavings,
      recommendation: 'تنفيذ التحويل المقترح وفق جدول التسوية',
    })),
    riskFlags: [],
    insights: [
      `حفظ الأرصدة الصافية: Σ الأرصدة = 0 بعد ${formatNumber(portfolioCountAfter)} تحويل صافٍ.`,
      `تحرير سيولة ${formatSar(portfolioSavings, true)} دون إنشاء أو إتلاف قيمة.`,
      `العينة المعروضة ${formatNumber(demoBeforeTransferSample.length)} علاقة من أصل ${formatNumber(portfolioCountBefore)} تحويل نشط.`,
    ],
  }
}

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

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  accentClass = 'text-primary',
}: {
  icon: ElementType
  title: string
  description?: string
  children: ReactNode
  accentClass?: string
}) {
  return (
    <Card className="border-border/60 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-lg bg-muted',
              accentClass,
            )}
          >
            <Icon className="size-4" />
          </span>
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}

function NettingResultDialog({
  open,
  onClose,
  analysis,
  apiError,
  countBefore: before,
  grossVolume,
}: DialogProps) {
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  // Metrics always match Dashboard — same computeNetting() portfolio KPIs.
  const countAfter =
    analysis?.metrics.recommendedTransactions ?? portfolioCountAfter
  const volumeAfter = analysis?.metrics.totalNetVolume ?? portfolioNet
  const volumeSaved = analysis?.metrics.estimatedSavings ?? portfolioSavings
  const efficiencyPct = analysis?.metrics.efficiencyPct ?? portfolioSavingsPct
  const countReduction =
    before > 0 ? Math.round((1 - countAfter / before) * 100) : 0
  const savedTransfers = before - countAfter

  async function handleExportPdf() {
    if (!analysis || isExporting) return
    setIsExporting(true)
    try {
      const { exportNettingPdf } = await import('@/lib/export-netting-pdf')
      await exportNettingPdf({
        analysis,
        companies: demoCompanies.slice(0, 24),
        countBefore: before,
        grossVolume,
      })
    } catch (err) {
      console.error('[netting] PDF export failed', err)
    } finally {
      setIsExporting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="netting-dialog-title"
        className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-card shadow-2xl lg:max-w-3xl"
        style={{ maxHeight: 'min(85vh, 820px)' }}
      >
        {/* Fixed header */}
        <div className="shrink-0 border-b bg-gradient-to-l from-primary/[0.06] to-card px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-xl',
                  apiError
                    ? 'bg-red-500/10 text-red-600'
                    : 'bg-emerald-500/10 text-emerald-600',
                )}
              >
                {apiError ? (
                  <AlertTriangle className="size-5" />
                ) : (
                  <CheckCircle2 className="size-5" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
                  Tawazun Executive Report
                </p>
                <h2
                  id="netting-dialog-title"
                  className="mt-0.5 text-lg font-bold tracking-tight"
                >
                  {apiError ? 'فشل تحليل المقاصة' : 'التقرير التنفيذي للمقاصة'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {apiError
                    ? apiError
                    : 'ملخص مالي جاهز للمراجعة والتصدير PDF'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={onClose}
              aria-label="إغلاق"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {apiError || !analysis ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertTriangle className="mb-4 size-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {apiError ?? 'تعذّر جلب نتائج التحليل'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Key metrics */}
              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  مؤشرات الدورة
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border bg-background p-3 text-center">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      قبل المقاصة
                    </p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-red-600">
                      {formatNumber(before)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">تحويل</p>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
                    <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      بعد المقاصة
                    </p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-emerald-600">
                      {formatNumber(countAfter)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">تحويل</p>
                  </div>
                  <div className="rounded-lg border bg-background p-3 text-center">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      التوفير
                    </p>
                    <p className="mt-1 text-base font-bold tabular-nums text-primary">
                      {formatSar(volumeSaved, true)}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-background p-3 text-center">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      الكفاءة
                    </p>
                    <p className="mt-1 text-xl font-bold tabular-nums">
                      {formatPercent(efficiencyPct)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-800/10 bg-slate-900 px-4 py-3 text-white dark:bg-slate-800">
                  <p className="text-xs text-white/70">الحجم الإجمالي</p>
                  <p className="mt-1 font-mono text-sm font-semibold tabular-nums">
                    {formatSar(grossVolume, true)}
                  </p>
                </div>
                <div className="rounded-lg border bg-primary px-4 py-3 text-primary-foreground">
                  <p className="text-xs text-primary-foreground/80">الحجم الصافي</p>
                  <p className="mt-1 font-mono text-sm font-semibold tabular-nums">
                    {formatSar(volumeAfter, true)}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-700/20 bg-emerald-700 px-4 py-3 text-white">
                  <p className="text-xs text-white/80">تحويلات محذوفة</p>
                  <p className="mt-1 font-mono text-sm font-semibold tabular-nums">
                    {formatNumber(savedTransfers)} ({formatPercent(countReduction)})
                  </p>
                </div>
              </div>

              <SectionCard
                icon={FileText}
                title="الملخص التنفيذي"
                description="نظرة شاملة على نتائج المقاصة"
              >
                <p className="text-sm leading-relaxed text-foreground/90">
                  {analysis.summary}
                </p>
              </SectionCard>

              {analysis.riskFlags.length > 0 && (
                <SectionCard
                  icon={ShieldAlert}
                  title="مؤشرات المخاطر"
                  description={`${formatNumber(analysis.riskFlags.length)} شركة تستدعي المتابعة`}
                  accentClass="text-amber-600"
                >
                  <div className="space-y-2">
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
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                            {flag.description}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            SEVERITY_BADGE[flag.severity],
                          )}
                        >
                          {SEVERITY_LABEL[flag.severity]}
                        </span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {analysis.nettingOpportunities.length > 0 && (
                <SectionCard
                  icon={CheckCircle2}
                  title="التوصيات"
                  description={`${formatNumber(analysis.nettingOpportunities.length)} تحويل صافٍ — عرض أكبر ${formatNumber(Math.min(15, analysis.nettingOpportunities.length))}`}
                  accentClass="text-emerald-600"
                >
                  <div className="space-y-2">
                    {[...analysis.nettingOpportunities]
                      .sort((a, b) => b.netAmount - a.netAmount)
                      .slice(0, 15)
                      .map((op, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-emerald-200 bg-emerald-50/40 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/20"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2 text-sm">
                            <span className="truncate font-medium">
                              {op.companies[0]}
                            </span>
                            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate text-muted-foreground">
                              {op.companies[1]}
                            </span>
                          </div>
                          <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                            {formatSar(op.netAmount)}
                          </span>
                        </div>
                        {op.recommendation && (
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            {op.recommendation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {analysis.insights.length > 0 && (
                <SectionCard
                  icon={Lightbulb}
                  title="رؤى مالية"
                  description="تحليل مدعوم بـ GPT-4o"
                  accentClass="text-amber-500"
                >
                  <div className="space-y-2">
                    {analysis.insights.map((insight, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg border bg-muted/30 px-4 py-3 text-sm"
                      >
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {formatNumber(i + 1)}
                        </span>
                        <p className="leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>
          )}
        </div>

        {/* Fixed footer */}
        <div className="shrink-0 border-t bg-card px-6 py-4">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-muted-foreground sm:text-start">
              {!apiError && analysis && (
                <>
                  المبلغ المتبقي:{' '}
                  <span className="font-mono font-medium text-foreground">
                    {formatSar(volumeAfter)}
                  </span>
                </>
              )}
            </p>
            <div className="flex gap-2">
              {!apiError && analysis && (
                <Button
                  variant="outline"
                  className="flex-1 gap-2 sm:flex-none"
                  onClick={handleExportPdf}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  تنزيل التقرير PDF
                </Button>
              )}
              <Button
                className="flex-1 sm:flex-none"
                onClick={onClose}
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ─── BeforePanel ──────────────────────────────────────────────────────────────

function BeforePanel() {
  return (
    <Card className="treasury-card">
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
              {formatNumber(portfolioCountBefore)}
            </p>
            <p className="text-xs text-muted-foreground">تحويل</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-[11px] text-muted-foreground">
          أكبر {formatNumber(beforeTxs.length)} علاقات من المحفظة — الإجمالي من
          computeNetting(): {formatNumber(portfolioCountBefore)} تحويل ·{' '}
          {formatSar(portfolioGross, true)}
        </p>
        {beforeTxs.map((tx) => (
          <TxRow key={tx.id} tx={tx} variant="neutral" />
        ))}
        <div className="flex items-center justify-between rounded-lg border border-dashed p-3 text-sm">
          <span className="text-muted-foreground">إجمالي المحفظة (محسوب)</span>
          <span className="font-mono font-bold tabular-nums">
            {formatSar(portfolioGross, true)}
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
  const afterTxs: TxItem[] = (
    analysis?.nettingOpportunities ??
    demoAfterTransferSample.map((t) => ({
      companies: [t.from, t.to],
      netAmount: t.amount,
      direction: `${t.from} → ${t.to}`,
      savings: t.bilateralSavings,
      recommendation: '',
    }))
  )
    .slice(0, demoAfterTransferSample.length)
    .map((op, i) => ({
      id: `n${i + 1}`,
      from: op.companies[0] ?? '',
      to: op.companies[1] ?? '',
      amount: op.netAmount,
    }))

  return (
    <Card
      className={cn(
        'treasury-card transition-opacity duration-300',
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
          <div className="text-end">
            <p className="text-lg font-bold tabular-nums text-emerald-600">
              {formatNumber(portfolioCountAfter)}
            </p>
            <p className="text-xs text-muted-foreground">تحويل</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {done && analysis ? (
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground">
              أكبر التحويلات الصافية — الإجمالي:{' '}
              {formatNumber(portfolioCountAfter)} تحويل · توفير{' '}
              {formatSar(portfolioSavings, true)}
            </p>
            {afterTxs.map((tx, i) => (
              <TxRow
                key={tx.id}
                tx={tx}
                variant="success"
                recommendation={analysis.nettingOpportunities[i]?.recommendation}
              />
            ))}
            <div className="flex items-center justify-between rounded-lg border border-dashed border-emerald-300 p-3 text-sm dark:border-emerald-800">
              <span className="text-muted-foreground">صافي المحفظة (محسوب)</span>
              <span className="font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatSar(portfolioNet, true)}
              </span>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/40">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  وُفِّر {formatSar(portfolioSavings, true)} —{' '}
                  {formatPercent(portfolioSavingsPct)} تخفيض في الحجم
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

function AiInsightsSection({ analysis }: { analysis: NettingAnalysisResult }) {
  return (
    <div className="space-y-4">
      {/* Risk flags */}
      {analysis.riskFlags.length > 0 && (
        <Card className="treasury-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-500" />
              مؤشرات المخاطر
            </CardTitle>
            <CardDescription>
              {formatNumber(analysis.riskFlags.length)} شركة تستدعي المتابعة
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
        <Card className="treasury-card">
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
                  {formatNumber(i + 1)}
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

const WORKFLOW_STEPS: WorkflowStepId[] = [
  'notification',
  'opportunity',
  'approvals',
  'execution',
  'report',
]

function parseWorkflowStep(value: string | null): WorkflowStepId {
  if (value && WORKFLOW_STEPS.includes(value as WorkflowStepId)) {
    return value as WorkflowStepId
  }
  return 'notification'
}

export function NettingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isRunning, setIsRunning] = useState(false)
  const [nettingDone, setNettingDone] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [analysis, setAnalysis] = useState<NettingAnalysisResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [workflowOpen, setWorkflowOpen] = useState(
    () => searchParams.get('workflow') === '1',
  )
  const [sessionResetToken, setSessionResetToken] = useState(0)

  const workflowStep = parseWorkflowStep(searchParams.get('step'))
  const workflowOpportunityId =
    searchParams.get('id') ?? PRIMARY_OPPORTUNITY_ID

  useEffect(() => {
    if (searchParams.get('workflow') === '1') {
      setWorkflowOpen(true)
    }
  }, [searchParams])

  const kpiCards: StatCard[] = [
    {
      id: 'before',
      label: 'التحويلات قبل المقاصة',
      value: formatNumber(portfolioCountBefore),
      sub: 'تحويل في المحفظة التجريبية',
      icon: TrendingUp,
      colorClass: 'bg-red-500/10 text-red-600',
    },
    {
      id: 'after',
      label: 'التحويلات بعد المقاصة',
      value: formatNumber(portfolioCountAfter),
      sub: `${formatNumber(portfolioCountBefore)} → ${formatNumber(portfolioCountAfter)}`,
      icon: TrendingDown,
      colorClass: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      id: 'savings',
      label: 'التوفير المتوقع',
      value: formatSar(portfolioSavings, true),
      sub: formatPercent(demoPortfolio.savingsPct),
      icon: Minus,
      colorClass: 'bg-primary/10 text-primary',
    },
    {
      id: 'total',
      label: 'إجمالي قيمة الديون',
      value: formatSar(portfolioGross, true),
      sub: `${formatNumber(demoPortfolio.participatingCompanies)} شركة مشاركة`,
      icon: Zap,
      colorClass: 'bg-amber-500/10 text-amber-600',
    },
  ]

  async function handleRunNetting() {
    if (isRunning || nettingDone) return
    setIsRunning(true)
    setApiError(null)

    // Numbers always come from computeNetting on the enterprise dataset.
    const local = buildLocalAnalysis()
    setAnalysis(local)

    try {
      // AI adds qualitative Arabic narrative only; metrics stay from local.
      // Debt rows are lazy-loaded so the main bundle does not embed the full ledger.
      const { debtRecords } = await import('@/data/debts-mock')
      const res = await fetch(`${API_BASE}/api/ai/netting-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companies: demoCompanies,
          debtRecords,
        }),
      })

      if (res.ok) {
        const data = (await res.json()) as {
          success: boolean
          analysis: NettingAnalysisResult
        }
        const api = data.analysis
        setAnalysis({
          ...local,
          summary: api.summary || local.summary,
          riskFlags: api.riskFlags?.length ? api.riskFlags : local.riskFlags,
          insights: api.insights?.length ? api.insights : local.insights,
          nettingOpportunities: local.nettingOpportunities.map((op, i) => ({
            ...op,
            recommendation:
              api.nettingOpportunities[i]?.recommendation ?? op.recommendation,
          })),
          // Keep algorithm metrics from the generated portfolio (same source as Dashboard).
          metrics: local.metrics,
        })
      } else {
        // AI optional — KPIs/transfers already set from local computeNetting results.
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string
        }
        console.warn('[netting] AI enrichment skipped', res.status, payload)
      }
    } catch (err) {
      console.warn('[netting] AI enrichment failed; using local analysis', err)
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
    setSessionResetToken((token) => token + 1)
  }

  function openWorkflow(step: WorkflowStepId = 'notification') {
    setWorkflowOpen(true)
    setSearchParams(
      {
        workflow: '1',
        step,
        id: workflowOpportunityId,
      },
      { replace: true },
    )
  }

  function closeWorkflow() {
    setWorkflowOpen(false)
    const next = new URLSearchParams(searchParams)
    next.delete('workflow')
    next.delete('step')
    next.delete('id')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المقاصة الذكية</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            جلسة خزينة على مجموعة بيانات مؤسسية حقيقية ({formatNumber(demoPortfolio.participatingCompanies)}{' '}
            شركة · {formatNumber(demoPortfolio.financialRelationships)} علاقة) —
            المؤشرات من computeNetting() دون تعديل الخوارزمية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => openWorkflow('notification')}
          >
            <GitBranch className="size-4" />
            مسار التسوية
          </Button>
          {nettingDone && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              إعادة التعيين
            </Button>
          )}
        </div>
      </div>

      <EnterpriseNettingSessionPanel
        companies={sampleCompanies.map((c) => ({
          id: c.id,
          name: c.name,
          nameEn: c.nameEn,
        }))}
        isExecuting={isRunning}
        nettingDone={nettingDone}
        resetToken={sessionResetToken}
        onExecute={() => {
          void handleRunNetting()
        }}
      />

      {/* KPI cards — same computeNetting() portfolio as Dashboard */}
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
        countBefore={portfolioCountBefore}
        grossVolume={portfolioGross}
      />

      <SettlementWorkflow
        open={workflowOpen}
        onClose={closeWorkflow}
        opportunityId={workflowOpportunityId}
        initialStep={workflowStep}
        hasAnalysis={Boolean(analysis)}
        isRunningNetting={isRunning}
        onOpenReport={() => {
          setDialogOpen(true)
        }}
        onRunNetting={() => {
          void handleRunNetting()
        }}
      />
    </div>
  )
}
