export type NettingTx = {
  id: string
  from: string
  to: string
  amount: number
}

// ─── Before netting ───────────────────────────────────────────────────────────
export const beforeNetting: NettingTx[] = [
  { id: 'b1', from: 'شركة ألف للتجارة', to: 'شركة باء القابضة', amount: 850_000 },
  { id: 'b2', from: 'شركة باء القابضة', to: 'شركة جيم للمقاولات', amount: 620_000 },
  { id: 'b3', from: 'شركة جيم للمقاولات', to: 'شركة ألف للتجارة', amount: 480_000 },
  { id: 'b4', from: 'شركة دال للخدمات', to: 'شركة باء القابضة', amount: 320_000 },
  { id: 'b5', from: 'شركة هـ للتمويل', to: 'شركة واو للتوريد', amount: 230_000 },
  { id: 'b6', from: 'شركة واو للتوريد', to: 'شركة دال للخدمات', amount: 195_000 },
]

// ─── After netting (AI-optimised) ────────────────────────────────────────────
// Cycle ألف/باء/جيم is resolved; chain واو/دال offset applied
export const afterNetting: NettingTx[] = [
  { id: 'a1', from: 'شركة ألف للتجارة', to: 'شركة باء القابضة', amount: 370_000 },
  { id: 'a2', from: 'شركة باء القابضة', to: 'شركة جيم للمقاولات', amount: 140_000 },
  { id: 'a3', from: 'شركة هـ للتمويل', to: 'شركة دال للخدمات', amount: 125_000 },
]

// ─── Derived stats ────────────────────────────────────────────────────────────
export const VOLUME_BEFORE = beforeNetting.reduce((s, t) => s + t.amount, 0) // 2,695,000
export const VOLUME_AFTER = afterNetting.reduce((s, t) => s + t.amount, 0)   // 635,000
export const VOLUME_SAVED = VOLUME_BEFORE - VOLUME_AFTER                      // 2,060,000
export const COUNT_BEFORE = beforeNetting.length                              // 6
export const COUNT_AFTER = afterNetting.length                                // 3
export const COUNT_REDUCTION_PCT = Math.round(
  (1 - COUNT_AFTER / COUNT_BEFORE) * 100,
)                                                                             // 50
export const VOLUME_REDUCTION_PCT = Math.round(
  (1 - VOLUME_AFTER / VOLUME_BEFORE) * 100,
)                                                                             // 76
