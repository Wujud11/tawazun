import { Building2, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { NettingWorkflowTimeline } from '@/components/netting/netting-workflow-timeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DEMO_DATA_DISCLAIMER_AR,
  SAMPLE_PARTICIPANTS_LABEL_AR,
  SAMPLE_PARTICIPANT_COUNT,
  enterprisePortfolioScale,
} from '@/data/enterprise-demo-scale'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  buildSessionTimeline,
  getNettingSessionService,
  type NettingSession,
} from '@/services/netting-session'

type CompanyInput = {
  id: string
  name: string
  nameEn: string
}

type Props = {
  companies: CompanyInput[]
  isExecuting: boolean
  nettingDone: boolean
  onExecute: () => void
  onResetSession?: () => void
  resetToken?: number
}

export function EnterpriseNettingSessionPanel({
  companies,
  isExecuting,
  nettingDone,
  onExecute,
  resetToken = 0,
}: Props) {
  const service = useMemo(() => getNettingSessionService(), [])
  const sampleCompanies = useMemo(
    () => companies.slice(0, SAMPLE_PARTICIPANT_COUNT),
    [companies],
  )
  const [session, setSession] = useState<NettingSession | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    setSession(null)
    setIsCreating(false)
  }, [resetToken])

  useEffect(() => {
    if (!session) return

    const stop = service.watchApprovals(session, (next) => {
      setSession(next)
    })
    return stop
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed by session id only
  }, [service, session?.id])

  const timeline = buildSessionTimeline(session, {
    isExecuting,
    reportReady: nettingDone,
  })

  const approvedCount =
    session?.participants.filter((p) => p.status === 'approved').length ?? 0
  const sampleTotal = session?.participants.length ?? sampleCompanies.length
  const allApproved = Boolean(
    session &&
      session.participants.length > 0 &&
      session.participants.every((p) => p.status === 'approved'),
  )
  const canExecute =
    allApproved &&
    !isExecuting &&
    !nettingDone &&
    session?.phase === 'ready_to_execute'

  async function handleCreateSession() {
    if (isCreating || session) return
    setIsCreating(true)
    try {
      const created = await service.createSession({ companies: sampleCompanies })
      setSession({
        ...created,
        statusLabel: `جاري تجهيز جلسة المقاصة · ${formatNumber(enterprisePortfolioScale.participatingCompanies)} شركة في المحفظة التجريبية`,
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="treasury-card overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base">سير عمل جلسة المقاصة</CardTitle>
            <CardDescription className="mt-1">
              محفظة تجريبية بحجم مؤسسي — الاعتماد التفصيلي يعرض عينة فقط
            </CardDescription>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">
                {formatNumber(enterprisePortfolioScale.participatingCompanies)}{' '}
                شركة مشاركة
              </Badge>
              <Badge variant="outline">
                {formatNumber(enterprisePortfolioScale.financialRelationships)}{' '}
                علاقة مالية
              </Badge>
              <Badge variant="outline">{DEMO_DATA_DISCLAIMER_AR}</Badge>
            </div>
          </div>
          {session ? (
            <div className="rounded-lg border bg-background px-3 py-2 text-start sm:text-end">
              <p className="text-[11px] text-muted-foreground">{session.title}</p>
              <p className="font-mono text-sm font-semibold tracking-wide">
                {session.id}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {session.statusLabel}
              </p>
            </div>
          ) : (
            <Badge variant="secondary">لم تُنشأ جلسة بعد</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 p-5 lg:grid-cols-[220px_1fr]">
        <div className="rounded-xl border bg-muted/10 p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            الجدول الزمني
          </p>
          <NettingWorkflowTimeline steps={timeline} />
        </div>

        <div className="space-y-4">
          {!session ? (
            <div className="space-y-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Building2 className="size-4 text-primary" />
                  {SAMPLE_PARTICIPANTS_LABEL_AR}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Sample Participants —{' '}
                  {formatNumber(sampleCompanies.length)} من أصل{' '}
                  {formatNumber(
                    enterprisePortfolioScale.participatingCompanies,
                  )}
                </p>
              </div>
              <div className="space-y-2">
                {sampleCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-background px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {company.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {company.nameEn}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      جاهزة للاعتماد
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed p-4">
                <p className="text-sm text-muted-foreground">
                  ابدأ بإنشاء جلسة مقاصة. الاعتماد التفصيلي يبقى على هذه العينة
                  فقط، بينما مؤشرات الجلسة تعكس النطاق المؤسسي التجريبي.
                </p>
                <Button
                  className="gap-2"
                  onClick={() => void handleCreateSession()}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جاري تجهيز الجلسة…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      إنشاء جلسة مقاصة
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="size-4 text-primary" />
                    {SAMPLE_PARTICIPANTS_LABEL_AR}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Sample Participants —{' '}
                    {formatNumber(sampleTotal)} من أصل{' '}
                    {formatNumber(
                      enterprisePortfolioScale.participatingCompanies,
                    )}
                  </p>
                </div>
                <Badge variant={allApproved ? 'success' : 'warning'}>
                  {formatNumber(approvedCount)} / {formatNumber(sampleTotal)}{' '}
                  من العينة وافقت
                </Badge>
              </div>

              <div className="space-y-2">
                {session.participants.map((participant) => {
                  const approved = participant.status === 'approved'
                  return (
                    <div
                      key={participant.companyId}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                        approved
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20'
                          : 'bg-background',
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {participant.companyName}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {participant.companyNameEn}
                        </p>
                      </div>
                      {approved ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="size-3.5" />
                          تم الاعتماد
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                          <span className="size-2 rounded-full bg-amber-400" />
                          بانتظار الاعتماد
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                <Button
                  className="gap-2"
                  onClick={onExecute}
                  disabled={!canExecute}
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جارٍ تنفيذ المقاصة…
                    </>
                  ) : nettingDone ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      تم تنفيذ المقاصة
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      تنفيذ المقاصة
                    </>
                  )}
                </Button>
                {!allApproved && (
                  <p className="text-xs text-muted-foreground">
                    يُفعَّل زر التنفيذ بعد اعتماد جميع شركات العينة المعروضة.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
