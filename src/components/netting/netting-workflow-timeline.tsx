import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

import type { TimelineStep } from '@/services/netting-session'
import { cn } from '@/lib/utils'

type Props = {
  steps: TimelineStep[]
}

export function NettingWorkflowTimeline({ steps }: Props) {
  return (
    <ol className="flex flex-col gap-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex w-6 flex-col items-center">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full border transition-colors',
                  step.status === 'done' &&
                    'border-emerald-500 bg-emerald-500 text-white',
                  step.status === 'active' &&
                    'border-primary bg-primary text-primary-foreground',
                  step.status === 'pending' &&
                    'border-border bg-background text-muted-foreground',
                )}
              >
                {step.status === 'done' ? (
                  <CheckCircle2 className="size-3.5" />
                ) : step.status === 'active' ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Circle className="size-3" />
                )}
              </span>
              {!isLast && (
                <span
                  className={cn(
                    'my-1 w-px flex-1 min-h-4',
                    step.status === 'done' ? 'bg-emerald-400/70' : 'bg-border',
                  )}
                />
              )}
            </div>
            <div className={cn('pb-4', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-medium leading-6',
                  step.status === 'active' && 'text-primary',
                  step.status === 'pending' && 'text-muted-foreground',
                  step.status === 'done' && 'text-foreground',
                )}
              >
                {step.label}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
