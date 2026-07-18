import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Loader2,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SAMPLE_PARTICIPANTS_LABEL_AR } from '@/data/enterprise-demo-scale'
import {
  getOpportunityById,
  getPrimaryOpportunity,
  settlementWorkflowSteps,
} from '@/data/workflow-mock'
import { formatDateTime, formatNumber, formatPercent, formatSar } from '@/lib/format'
import { cn } from '@/lib/utils'
import type {
  ApprovalStatus,
  CompanyApproval,
  SettlementOpportunity,
  WorkflowStepId,
} from '@/types/workflow'

type SettlementWorkflowProps = {
  open: boolean
  onClose: () => void
  opportunityId?: string | null
  initialStep?: WorkflowStepId
  hasAnalysis: boolean
  isRunningNetting: boolean
  onOpenReport: () => void
  onRunNetting: () => void
}

const STEP_ORDER: WorkflowStepId[] = settlementWorkflowSteps.map((s) => s.id)

const ROLE_LABEL: Record<CompanyApproval['role'], string> = {
  debtor: 'مدين',
  creditor: 'دائن',
  both: 'مدين / دائن',
}

const STATUS_META: Record<
  ApprovalStatus,
  { label: string; variant: 'success' | 'warning' | 'destructive' }
> = {
  approved: { label: 'معتمد', variant: 'success' },
  pending: { label: 'معلّق', variant: 'warning' },
  rejected: { label: 'مرفوض', variant: 'destructive' },
}

function stepIndex(step: WorkflowStepId): number {
  return STEP_ORDER.indexOf(step)
}

export function SettlementWorkflow({
  open,
  onClose,
  opportunityId,
  initialStep = 'notification',
  hasAnalysis,
  isRunningNetting,
  onOpenReport,
  onRunNetting,
}: SettlementWorkflowProps) {
  const opportunity = useMemo(
    () =>
      (opportunityId && getOpportunityById(opportunityId)) ||
      getPrimaryOpportunity(),
    [opportunityId],
  )

  const [step, setStep] = useState<WorkflowStepId>(initialStep)
  const [approvals, setApprovals] = useState<CompanyApproval[]>(
    opportunity.approvals,
  )
  const [executionProgress, setExecutionProgress] = useState(0)
  const [executionDone, setExecutionDone] = useState(false)

  useEffect(() => {
    if (!open) return
    setStep(initialStep)
    setApprovals(opportunity.approvals)
    setExecutionProgress(0)
    setExecutionDone(false)
  }, [open, initialStep, opportunity])

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

  useEffect(() => {
    if (!open || step !== 'execution') return

    setExecutionProgress(0)
    setExecutionDone(false)

    const timer = window.setInterval(() => {
      setExecutionProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(timer)
          setExecutionDone(true)
          return 100
        }
        return Math.min(100, prev + 8)
      })
    }, 220)

    return () => window.clearInterval(timer)
  }, [open, step])

  if (!open) return null

  const currentIndex = stepIndex(step)
  const approvedCount = approvals.filter((a) => a.status === 'approved').length
  const pendingCount = approvals.filter((a) => a.status === 'pending').length

  function goNext() {
    const next = STEP_ORDER[currentIndex + 1]
    if (next) setStep(next)
  }

  function goPrev() {
    const prev = STEP_ORDER[currentIndex - 1]
    if (prev) setStep(prev)
  }

  function setApprovalStatus(id: string, status: ApprovalStatus) {
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              decidedAt: new Date().toISOString(),
              note:
                status === 'approved'
                  ? 'تمت الموافقة من لوحة العرض'
                  : status === 'rejected'
                    ? 'تم الرفض من لوحة العرض'
                    : a.note,
            }
          : a,
      ),
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settlement-workflow-title"
        className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border bg-card shadow-2xl sm:rounded-xl"
        style={{ maxHeight: 'min(90vh, 880px)' }}
      >
        <div className="shrink-0 border-b px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">
                مسار التسوية متعددة الأطراف
              </p>
              <h2
                id="settlement-workflow-title"
                className="mt-1 text-lg font-bold tracking-tight"
              >
                {opportunity.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                إشعار → مراجعة → موافقات → تنفيذ → تقرير تنفيذي
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="إغلاق"
            >
              <X className="size-4" />
            </Button>
          </div>

          <ol className="mt-4 flex items-center gap-1 overflow-x-auto pb-1">
            {settlementWorkflowSteps.map((item, index) => {
              const active = item.id === step
              const done = index < currentIndex
              return (
                <li key={item.id} className="flex min-w-0 flex-1 items-center">
                  <button
                    type="button"
                    onClick={() => setStep(item.id)}
                    className={cn(
                      'flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2 text-center transition-colors',
                      active && 'bg-primary/10',
                      !active && 'hover:bg-muted/60',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-7 items-center justify-center rounded-full text-xs font-bold',
                        done && 'bg-emerald-500 text-white',
                        active && !done && 'bg-primary text-primary-foreground',
                        !active &&
                          !done &&
                          'bg-muted text-muted-foreground',
                      )}
                    >
                      {done ? <CheckCircle2 className="size-3.5" /> : index + 1}
                    </span>
                    <span
                      className={cn(
                        'truncate text-[10px] font-medium sm:text-xs',
                        active ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {item.shortLabel}
                    </span>
                  </button>
                  {index < settlementWorkflowSteps.length - 1 && (
                    <ArrowRight className="mx-0.5 hidden size-3 shrink-0 text-muted-foreground/50 sm:block" />
                  )}
                </li>
              )
            })}
          </ol>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {step === 'notification' && (
            <NotificationStep opportunity={opportunity} />
          )}
          {step === 'opportunity' && (
            <OpportunityStep opportunity={opportunity} />
          )}
          {step === 'approvals' && (
            <ApprovalsStep
              approvals={approvals}
              approvedCount={approvedCount}
              pendingCount={pendingCount}
              onSetStatus={setApprovalStatus}
            />
          )}
          {step === 'execution' && (
            <ExecutionStep
              opportunity={opportunity}
              progress={Math.min(executionProgress, 100)}
              done={executionDone}
            />
          )}
          {step === 'report' && (
            <ReportStep
              opportunity={opportunity}
              hasAnalysis={hasAnalysis}
              isRunningNetting={isRunningNetting}
              onOpenReport={onOpenReport}
              onRunNetting={onRunNetting}
            />
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t bg-card px-5 py-3 sm:px-6">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            السابق
          </Button>
          <div className="text-xs text-muted-foreground">
            الخطوة {formatNumber(currentIndex + 1)} من{' '}
            {formatNumber(STEP_ORDER.length)}
          </div>
          {currentIndex < STEP_ORDER.length - 1 ? (
            <Button onClick={goNext} className="gap-1.5">
              التالي
              <ArrowRight className="size-3.5" />
            </Button>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              إنهاء المسار
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

function NotificationStep({
  opportunity,
}: {
  opportunity: SettlementOpportunity
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-900 dark:bg-violet-950/30">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              تم اكتشاف فرصة تسوية جديدة
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              رصد النظام شبكة ديون متقاطعة بين{' '}
              {formatNumber(opportunity.companyCount)} شركات بتاريخ{' '}
              {formatDateTime(new Date(opportunity.detectedAt))}. يُوصى بمراجعة
              الفرصة ثم جمع موافقات الشركات قبل التنفيذ.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoTile
          label="التوفير المتوقع"
          value={formatSar(opportunity.savings, true)}
        />
        <InfoTile
          label="تخفيض الحجم"
          value={formatPercent(opportunity.savingsPct)}
        />
        <InfoTile
          label="الشركات"
          value={formatNumber(opportunity.companyCount)}
        />
      </div>
    </div>
  )
}

function OpportunityStep({
  opportunity,
}: {
  opportunity: SettlementOpportunity
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {opportunity.summary}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoTile
          label="الحجم الإجمالي"
          value={formatSar(opportunity.grossAmount, true)}
        />
        <InfoTile
          label="الحجم الصافي"
          value={formatSar(opportunity.netAmount, true)}
          accent
        />
        <InfoTile
          label="تحويلات قبل المقاصة"
          value={formatNumber(opportunity.transfersBefore)}
        />
        <InfoTile
          label="تحويلات بعد المقاصة"
          value={formatNumber(opportunity.transfersAfter)}
          accent
        />
      </div>
      <div className="rounded-xl border p-4">
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold">
          <Building2 className="size-4 text-primary" />
          {SAMPLE_PARTICIPANTS_LABEL_AR}
        </p>
        <p className="mb-3 text-[11px] text-muted-foreground">
          Sample Participants — {formatNumber(opportunity.companies.length)} من
          أصل {formatNumber(opportunity.companyCount)} شركة في الدورة التجريبية
        </p>
        <div className="flex flex-wrap gap-2">
          {opportunity.companies.slice(0, 6).map((name) => (
            <Badge key={name} variant="secondary" className="font-normal">
              {name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

function ApprovalsStep({
  approvals,
  approvedCount,
  pendingCount,
  onSetStatus,
}: {
  approvals: CompanyApproval[]
  approvedCount: number
  pendingCount: number
  onSetStatus: (id: string, status: ApprovalStatus) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Building2 className="size-4 text-primary" />
          {SAMPLE_PARTICIPANTS_LABEL_AR}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Sample Participants — {formatNumber(approvals.length)} شركات معروضة
          للاعتماد
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="success">
          {formatNumber(approvedCount)} معتمد
        </Badge>
        <Badge variant="warning">
          {formatNumber(pendingCount)} معلّق
        </Badge>
        <Badge variant="destructive">
          {formatNumber(approvals.filter((a) => a.status === 'rejected').length)}{' '}
          مرفوض
        </Badge>
      </div>
      <div className="space-y-2">
        {approvals.map((approval) => {
          const meta = STATUS_META[approval.status]
          return (
            <div
              key={approval.id}
              className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{approval.companyName}</p>
                  <Badge variant="outline">{ROLE_LABEL[approval.role]}</Badge>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </div>
                {approval.note && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {approval.note}
                  </p>
                )}
              </div>
              {approval.status === 'pending' && (
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => onSetStatus(approval.id, 'rejected')}
                  >
                    <XCircle className="size-3.5" />
                    رفض
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => onSetStatus(approval.id, 'approved')}
                  >
                    <CheckCircle2 className="size-3.5" />
                    اعتماد
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ExecutionStep({
  opportunity,
  progress,
  done,
}: {
  opportunity: SettlementOpportunity
  progress: number
  done: boolean
}) {
  const phases = [
    'تجميع الأرصدة الصافية',
    'مطابقة التحويلات المُحسَّنة',
    'محاكاة أوامر التسوية',
    'تأكيد الإغلاق المحاسبي',
  ]
  const activePhase = Math.min(
    phases.length - 1,
    Math.floor((progress / 100) * phases.length),
  )

  return (
    <div className="space-y-5">
      <div
        className={cn(
          'rounded-xl border p-5 text-center',
          done
            ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30'
            : 'bg-muted/30',
        )}
      >
        {done ? (
          <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
        ) : (
          <Loader2 className="mx-auto size-10 animate-spin text-primary" />
        )}
        <p className="mt-3 text-base font-semibold">
          {done ? 'اكتملت محاكاة التنفيذ بنجاح' : 'جارٍ تنفيذ التسوية…'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {done
            ? `تم تقليص التحويلات إلى ${formatNumber(opportunity.transfersAfter)} بقيمة صافية ${formatSar(opportunity.netAmount, true)}`
            : phases[activePhase]}
        </p>
        <div className="mx-auto mt-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-xs tabular-nums text-muted-foreground">
          {formatPercent(progress)}
        </p>
      </div>
      <div className="space-y-2">
        {phases.map((phase, i) => {
          const complete = done || i < activePhase
          const current = !done && i === activePhase
          return (
            <div
              key={phase}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm',
                complete && 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20',
                current && 'border-primary/30 bg-primary/5',
              )}
            >
              {complete ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : current ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : (
                <ClipboardCheck className="size-4 text-muted-foreground" />
              )}
              <span>{phase}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ReportStep({
  opportunity,
  hasAnalysis,
  isRunningNetting,
  onOpenReport,
  onRunNetting,
}: {
  opportunity: SettlementOpportunity
  hasAnalysis: boolean
  isRunningNetting: boolean
  onOpenReport: () => void
  onRunNetting: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
            <FileText className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">التقرير التنفيذي</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              بعد استكمال مسار الموافقات والتنفيذ، يمكنك فتح تقرير تحليل المقاصة
              الحالي وتصديره PDF — دون استبدال منطق التقرير الحالي.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoTile label="التوفير" value={formatSar(opportunity.savings, true)} />
        <InfoTile
          label="الكفاءة"
          value={formatPercent(opportunity.savingsPct)}
        />
        <InfoTile
          label="التحويلات"
          value={`${formatNumber(opportunity.transfersBefore)} → ${formatNumber(opportunity.transfersAfter)}`}
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {hasAnalysis ? (
          <Button className="gap-2" onClick={onOpenReport}>
            <FileText className="size-4" />
            فتح التقرير التنفيذي
          </Button>
        ) : (
          <Button
            className="gap-2"
            onClick={onRunNetting}
            disabled={isRunningNetting}
          >
            {isRunningNetting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جارٍ التحليل…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                تشغيل التحليل وفتح التقرير
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

function InfoTile({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 font-mono text-sm font-semibold tabular-nums',
          accent && 'text-primary',
        )}
      >
        {value}
      </p>
    </div>
  )
}
