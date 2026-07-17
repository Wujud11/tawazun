import {
  ArrowLeftRight,
  BrainCircuit,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { recentActivity } from '@/data/dashboard-mock'
import { PRIMARY_OPPORTUNITY_ID } from '@/data/workflow-mock'
import { formatRelativeTime, formatSar } from '@/lib/format'
import type { ActivityType } from '@/types/dashboard'
import { cn } from '@/lib/utils'

const activityConfig: Record<
  ActivityType,
  { icon: typeof Sparkles; color: string; label: string }
> = {
  netting: {
    icon: Sparkles,
    color: 'bg-violet-500/10 text-violet-600',
    label: 'مقاصة',
  },
  transfer: {
    icon: ArrowLeftRight,
    color: 'bg-blue-500/10 text-blue-600',
    label: 'تحويل',
  },
  analysis: {
    icon: BrainCircuit,
    color: 'bg-amber-500/10 text-amber-600',
    label: 'تحليل',
  },
  settlement: {
    icon: CheckCircle2,
    color: 'bg-emerald-500/10 text-emerald-600',
    label: 'تسوية',
  },
}

export function RecentActivity() {
  return (
    <Card className="treasury-card h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>النشاط الأخير</CardTitle>
          <CardDescription className="mt-1">
            آخر عمليات المقاصة والتحليل والتحويل
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 text-xs">
          <Link
            to={`/netting?workflow=1&step=opportunity&id=${PRIMARY_OPPORTUNITY_ID}`}
          >
            فتح المسار
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pe-4">
          <div className="relative space-y-3 ps-2">
            <div
              aria-hidden
              className="absolute inset-y-1 start-[1.15rem] w-px bg-border"
            />
            {recentActivity.map((activity, index) => {
              const config = activityConfig[activity.type]
              const Icon = config.icon
              const isLatest = index === 0

              return (
                <div
                  key={activity.id}
                  className={cn(
                    'relative flex gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/40',
                    isLatest && 'border-primary/20 bg-primary/[0.03]',
                  )}
                >
                  <Avatar className="relative z-10 size-9 rounded-lg ring-2 ring-background">
                    <AvatarFallback className={cn('rounded-lg', config.color)}>
                      <Icon className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {activity.title}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-medium',
                          config.color,
                        )}
                      >
                        {config.label}
                      </span>
                      {activity.amount !== undefined ? (
                        <span className="font-mono text-xs font-medium tabular-nums">
                          {formatSar(activity.amount)}
                        </span>
                      ) : null}
                      {isLatest ? (
                        <span className="text-[10px] font-medium text-primary">
                          الأحدث
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
