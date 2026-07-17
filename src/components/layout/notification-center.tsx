import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  PRIMARY_OPPORTUNITY_ID,
  workflowNotifications as initialNotifications,
} from '@/data/workflow-mock'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { NotificationKind, WorkflowNotification } from '@/types/workflow'

const kindConfig: Record<
  NotificationKind,
  { icon: typeof Bell; label: string; color: string }
> = {
  opportunity: {
    icon: Sparkles,
    label: 'فرصة',
    color: 'bg-violet-500/10 text-violet-600',
  },
  approval: {
    icon: ClipboardCheck,
    label: 'موافقة',
    color: 'bg-amber-500/10 text-amber-600',
  },
  execution: {
    icon: CheckCircle2,
    label: 'تنفيذ',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  report: {
    icon: FileText,
    label: 'تقرير',
    color: 'bg-blue-500/10 text-blue-600',
  },
}

function stepForKind(kind: NotificationKind): string {
  switch (kind) {
    case 'opportunity':
      return 'opportunity'
    case 'approval':
      return 'approvals'
    case 'execution':
      return 'execution'
    case 'report':
      return 'report'
    default:
      return 'notification'
  }
}

export function NotificationCenter() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<WorkflowNotification[]>(initialNotifications)
  const rootRef = useRef<HTMLDivElement>(null)

  const unreadCount = useMemo(
    () => items.filter((n) => n.unread).length,
    [items],
  )

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    )
  }

  function handleReview(notification: WorkflowNotification) {
    markRead(notification.id)
    setOpen(false)
    const step = stepForKind(notification.kind)
    const opportunityId = notification.opportunityId || PRIMARY_OPPORTUNITY_ID
    navigate(`/netting?workflow=1&step=${step}&id=${opportunityId}`)
  }

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-lg"
        aria-label="الإشعارات"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute end-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="مركز الإشعارات"
          className="absolute end-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border bg-card shadow-xl"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="text-sm font-semibold">مركز الإشعارات</p>
              <p className="text-xs text-muted-foreground">
                مسار التسوية متعددة الأطراف
              </p>
            </div>
            {unreadCount > 0 ? (
              <Badge variant="warning">{unreadCount} جديد</Badge>
            ) : (
              <Badge variant="secondary">لا جديد</Badge>
            )}
          </div>

          <ScrollArea className="h-[320px]">
            <div className="space-y-1 p-2">
              {items.map((notification) => {
                const config = kindConfig[notification.kind]
                const Icon = config.icon

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'rounded-lg border p-3 transition-colors',
                      notification.unread
                        ? 'border-primary/20 bg-primary/5'
                        : 'border-transparent bg-muted/30',
                    )}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-lg',
                          config.color,
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">
                            {notification.title}
                          </p>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {notification.description}
                        </p>
                        <div className="mt-2.5 flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              'rounded px-1.5 py-0.5 text-[10px] font-medium',
                              config.color,
                            )}
                          >
                            {config.label}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2.5 text-xs"
                            onClick={() => handleReview(notification)}
                          >
                            مراجعة
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
