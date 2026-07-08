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
          <Card key={card.id} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <div className={cn('rounded-lg p-2', card.colorClass)}>
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
