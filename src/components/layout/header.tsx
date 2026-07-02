import { Bell, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">توازن</p>
            <p className="text-[10px] text-muted-foreground">Tawazun</p>
          </div>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Badge variant="secondary" className="hidden sm:inline-flex">
            منصة المقاصة الذكية
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground md:inline">
            {new Date('2026-06-29').toLocaleDateString('ar-SA', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <Button variant="ghost" size="icon" aria-label="الإشعارات">
            <Bell className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
