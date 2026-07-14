import {
  ArrowLeftRight,
  BrainCircuit,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { recentActivity } from '@/data/dashboard-mock'
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
      <CardHeader>
        <CardTitle>النشاط الأخير</CardTitle>
        <CardDescription>
          آخر عمليات المقاصة والتحليل والتحويل
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pe-4">
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const config = activityConfig[activity.type]
              const Icon = config.icon

              return (
                <div
                  key={activity.id}
                  className="flex gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
                >
                  <Avatar className="size-9 rounded-lg">
                    <AvatarFallback
                      className={cn('rounded-lg', config.color)}
                    >
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
                    <p className="mt-1 text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
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
