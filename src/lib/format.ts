/** English numerals with thousand separators — used app-wide. */
const EN = 'en-US'
/** Arabic labels with Latin digits for dates. */
const AR_LATN = 'ar-SA-u-nu-latn'

export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return value.toLocaleString(EN, options)
}

export function formatSar(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M ريال`
    }
    if (amount >= 1_000) {
      return `${formatNumber(Math.round(amount / 1_000))}K ريال`
    }
  }
  return `${formatNumber(amount)} ريال`
}

/** One decimal when the value is not a whole number; otherwise integer display. */
export function formatPercent(value: number): string {
  if (Number.isInteger(value)) {
    return `${formatNumber(value)}%`
  }
  return `${formatNumber(value, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`
}

export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(AR_LATN, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

export function formatDateTime(date: Date = new Date()): string {
  return date.toLocaleString(AR_LATN, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return 'منذ دقائق'
  if (diffHours < 24) return `منذ ${formatNumber(diffHours)} ساعة`
  const diffDays = Math.floor(diffHours / 24)
  return `منذ ${formatNumber(diffDays)} يوم`
}

/** Chart axis compact values (millions). */
export function formatAxisMillions(value: number): string {
  return `${formatNumber(value / 1_000_000)}M`
}

/** Chart axis compact values (thousands). */
export function formatAxisThousands(value: number): string {
  return `${formatNumber(value / 1_000)}K`
}
