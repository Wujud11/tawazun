import { Sparkles } from 'lucide-react'

import { NotificationCenter } from '@/components/layout/notification-center'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/format'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none tracking-tight">توازن</p>
            <p className="text-[10px] font-medium text-muted-foreground">
              Tawazun Treasury
            </p>
          </div>
          <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />
          <Badge variant="secondary" className="hidden font-normal sm:inline-flex">
            منصة المقاصة الذكية
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground md:inline">
            {formatDate(new Date('2026-06-29'), {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <NotificationCenter />
        </div>
      </div>
    </header>
  )
}
