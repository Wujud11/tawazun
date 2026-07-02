import {
  ArrowRight,
  CheckCircle2,
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
import {
  afterNetting,
  beforeNetting,
  COUNT_AFTER,
  COUNT_BEFORE,
  COUNT_REDUCTION_PCT,
  type NettingTx,
  VOLUME_AFTER,
  VOLUME_BEFORE,
  VOLUME_REDUCTION_PCT,
  VOLUME_SAVED,
} from '@/data/netting-mock'
import { formatSar } from '@/lib/format'
import { cn } from '@/lib/utils'

// ─── types ────────────────────────────────────────────────────────────────────

type DialogProps = {
  open: boolean
  onClose: () => void
}

// ─── KPI data ─────────────────────────────────────────────────────────────────

const kpiCards = [
  {
    id: 'before',
    label: 'التحويلات قبل المقاصة',
    value: COUNT_BEFORE.toLocaleString('ar-SA'),
    sub: 'تحويل في الشبكة',
    icon: TrendingUp,
    colorClass: 'bg-red-500/10 text-red-600',
  },
  {
    id: 'after',
    label: 'التحويلات بعد المقاصة',
    value: COUNT_AFTER.toLocaleString('ar-SA'),
    sub: 'تحويل بعد المقاصة',
    icon: TrendingDown,
    colorClass: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    id: 'reduction',
    label: 'نسبة التخفيض',
    value: `${COUNT_REDUCTION_PCT.toLocaleString('ar-SA')}%`,
    sub: 'تقليل في عدد التحويلات',
    icon: Minus,
    colorClass: 'bg-primary/10 text-primary',
  },
  {
    id: 'total',
    label: 'إجمالي قيمة الديون',
    value: formatSar(VOLUME_BEFORE, true),
    sub: 'قبل تطبيق المقاصة',
    icon: Zap,
    colorClass: 'bg-amber-500/10 text-amber-600',
  },
]

// ─── TxRow ────────────────────────────────────────────────────────────────────

function TxRow({
  tx,
  variant = 'neutral',
}: {
  tx: NettingTx
  variant?: 'neutral' | 'success'
}) {
  return (
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
  )
}

// ─── NettingResultDialog ──────────────────────────────────────────────────────

function NettingResultDialog({ open, onClose }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

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
          {/* Success header */}
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <CheckCircle2 className="size-7 text-emerald-600" />
            </div>
            <CardTitle className="text-xl">اكتملت عملية المقاصة</CardTitle>
            <CardDescription>
              تم حساب التحويلات المقترحة بعد تنفيذ المقاصة
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Stats strip */}
            <div className="grid grid-cols-3 divide-x divide-x-reverse divide-border rounded-lg border bg-muted/30 text-center">
              <div className="px-2 py-3">
                <p className="text-xl font-bold tabular-nums text-emerald-600 sm:text-2xl">
                  {(COUNT_BEFORE - COUNT_AFTER).toLocaleString('ar-SA')}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  تحويلات محذوفة
                </p>
              </div>
              <div className="px-2 py-3">
                <p className="text-xl font-bold tabular-nums text-primary sm:text-2xl">
                  {formatSar(VOLUME_SAVED, true)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  حجم موفّر
                </p>
              </div>
              <div className="px-2 py-3">
                <p className="text-xl font-bold tabular-nums sm:text-2xl">
                  {VOLUME_REDUCTION_PCT.toLocaleString('ar-SA')}%
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
                  {COUNT_AFTER.toLocaleString('ar-SA')} تحويلات
                </Badge>
              </div>
              <div className="space-y-2">
                {afterNetting.map((tx) => (
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
                  {formatSar(VOLUME_AFTER, true)}
                </span>
              </p>
              <Button onClick={onClose} size="sm">
                حسناً
              </Button>
            </div>
          </CardContent>
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
              {COUNT_BEFORE.toLocaleString('ar-SA')}
            </p>
            <p className="text-xs text-muted-foreground">تحويل</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {beforeNetting.map((tx) => (
          <TxRow key={tx.id} tx={tx} variant="neutral" />
        ))}
        <div className="flex items-center justify-between rounded-lg border border-dashed p-3 text-sm">
          <span className="text-muted-foreground">الإجمالي</span>
          <span className="font-mono font-bold tabular-nums">
            {formatSar(VOLUME_BEFORE, true)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── AfterPanel ───────────────────────────────────────────────────────────────

function AfterPanel({ done }: { done: boolean }) {
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
          {done && (
            <div className="text-end">
              <p className="text-lg font-bold tabular-nums text-emerald-600">
                {COUNT_AFTER.toLocaleString('ar-SA')}
              </p>
              <p className="text-xs text-muted-foreground">تحويل</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {done ? (
          <div className="space-y-2">
            {afterNetting.map((tx) => (
              <TxRow key={tx.id} tx={tx} variant="success" />
            ))}
            <div className="flex items-center justify-between rounded-lg border border-dashed border-emerald-300 p-3 text-sm dark:border-emerald-800">
              <span className="text-muted-foreground">الإجمالي</span>
              <span className="font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatSar(VOLUME_AFTER, true)}
              </span>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/40">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  وُفِّر {formatSar(VOLUME_SAVED, true)} —{' '}
                  {VOLUME_REDUCTION_PCT.toLocaleString('ar-SA')}% تخفيض في الحجم
                </span>
              </div>
            </div>
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

// ─── NettingPage ──────────────────────────────────────────────────────────────

export function NettingPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [nettingDone, setNettingDone] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  function handleRunNetting() {
    if (isRunning || nettingDone) return
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      setNettingDone(true)
      setDialogOpen(true)
    }, 1800)
  }

  function handleReset() {
    setNettingDone(false)
    setDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المقاصة الذكية</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تطبيق خوارزمية المقاصة متعددة الأطراف لتقليل عدد التحويلات مع الحفاظ على صافي الالتزامات
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.id} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div className={cn('rounded-lg p-2', card.colorClass)}>
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Before / After panels */}
      <div className="grid gap-6 xl:grid-cols-2">
        <BeforePanel />
        <AfterPanel done={nettingDone} />
      </div>

      {/* Result dialog */}
      <NettingResultDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  )
}
