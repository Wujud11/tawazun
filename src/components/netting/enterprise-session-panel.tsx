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
  const [session, setSession] = useState<NettingSession | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    setSession(null)
    setIsCreating(false)
  }, [resetToken])

  useEffect(() => {
    if (!session) return

    // Bind once per session id. Approval stream updates must not resubscribe.
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
  const totalCount = session?.participants.length ?? companies.length
  const allApproved = Boolean(
    session &&
      session.participants.length > 0 &&
      session.participants.every((p) => p.status === 'approved'),
  )
  const canExecute =
    allApproved && !isExecuting && !nettingDone && session?.phase === 'ready_to_execute'

  async function handleCreateSession() {
    if (isCreating || session) return
    setIsCreating(true)
    try {
      const created = await service.createSession({ companies })
      setSession(created)
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
              مسار خزينة متعدد الأطراف قبل تنفيذ خوارزمية المقاصة
            </CardDescription>
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
            <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed p-5">
              <p className="text-sm text-muted-foreground">
                ابدأ بإنشاء جلسة مقاصة رسمية. سيتم إشعار الشركات المشاركة ومحاكاة
                الاعتمادات قبل تفعيل التنفيذ.
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
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Building2 className="size-4 text-primary" />
                  الشركات المشاركة
                </p>
                <Badge variant={allApproved ? 'success' : 'warning'}>
                  {formatNumber(approvedCount)} / {formatNumber(totalCount)} شركات
                  وافقت
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
                    يُفعَّل زر التنفيذ بعد اعتماد جميع الشركات.
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
