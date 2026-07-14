import type { ElementType } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type StatCard = {
  id: string
  label: string
  value: string
  sub: string
  icon: ElementType
  colorClass: string
}

export function StatCardGrid({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.id}
            className="treasury-card group transition-all duration-200 hover:-translate-y-0.5"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <div
                className={cn(
                  'rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-105',
                  card.colorClass,
                )}
              >
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight tabular-nums">
                {card.value}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">{card.sub}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
