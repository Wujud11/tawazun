import { debtRecords } from '@/data/debts-mock'
import { deriveNetting } from '@/lib/derive'

// NettingTx is defined in derive.ts; re-exported here so existing consumers
// (netting.tsx) continue to import it from this module without changes.
export type { NettingTx } from '@/lib/derive'

// ─── Deterministic net settlement from active debtRecords ─────────────────────
// Active records: 11 obligations, 4,743,000 SAR gross volume
// Result        : 7 settlement transfers, 1,820,000 SAR net volume (62% reduction)

const result = deriveNetting(debtRecords)

export const beforeNetting = result.beforeTxs
export const afterNetting = result.afterTxs

export const VOLUME_BEFORE = result.volumeBefore    // 4,743,000
export const VOLUME_AFTER = result.volumeAfter      // 1,820,000
export const VOLUME_SAVED = result.volumeSaved      // 2,923,000
export const COUNT_BEFORE = result.countBefore      // 11
export const COUNT_AFTER = result.countAfter        // 7
export const COUNT_REDUCTION_PCT = result.countReductionPct   // 36
export const VOLUME_REDUCTION_PCT = result.volumeReductionPct // 62
