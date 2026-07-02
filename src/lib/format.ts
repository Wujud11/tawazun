export function formatSar(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M ر.س`
    }
    if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(0)}K ر.س`
    }
  }
  return `${amount.toLocaleString('ar-SA')} ر.س`
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString('ar-SA')}%`
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date('2026-06-29T12:00:00')
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return 'منذ دقائق'
  if (diffHours < 24) return `منذ ${diffHours.toLocaleString('ar-SA')} ساعة`
  const diffDays = Math.floor(diffHours / 24)
  return `منذ ${diffDays.toLocaleString('ar-SA')} يوم`
}
