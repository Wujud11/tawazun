import type { DebtRecord } from '@/data/debts-mock'
import type {
  Company,
  CompanyDebtShare,
  Debt,
  KpiMetric,
  TransferComparison,
} from '@/types/dashboard'
import { formatNumber, formatPercent, formatSar } from './format'
import { computeNetTransfers, type NettingTx } from './netting-core'

// ─── Shared types ─────────────────────────────────────────────────────────────

export type { NettingTx }

export type CompanyMeta = {
  id: string
  name: string
  nameEn: string
  sector: string
}

type NettingResult = {
  beforeTxs: NettingTx[]
  afterTxs: NettingTx[]
  volumeBefore: number
  volumeAfter: number
  volumeSaved: number
  countBefore: number
  countAfter: number
  countReductionPct: number
  volumeReductionPct: number
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function isActive(r: DebtRecord): boolean {
  return r.status !== 'settled'
}

/** Extract the short identifier word from a full Arabic company name.
 *  e.g. 'شركة ألف للتجارة' → 'ألف' */
function shortName(fullName: string): string {
  return fullName.trim().split(' ')[1] ?? fullName
}

// ─── Public derivation functions ──────────────────────────────────────────────

/**
 * Derive all company financial fields from active debtRecords.
 * Non-derivable metadata (id, name, nameEn, sector) is supplied via `meta`.
 * `meta` order defines the output order.
 */
export function deriveCompanies(
  records: DebtRecord[],
  meta: CompanyMeta[],
): Company[] {
  const active = records.filter(isActive)
  return meta.map((m) => {
    const asCreditor = active.filter((r) => r.creditor === m.name)
    const asDebtor = active.filter((r) => r.debtor === m.name)
    const totalReceivable = asCreditor.reduce((s, r) => s + r.amount, 0)
    const totalPayable = asDebtor.reduce((s, r) => s + r.amount, 0)
    return {
      id: m.id,
      name: m.name,
      nameEn: m.nameEn,
      sector: m.sector,
      netBalance: totalReceivable - totalPayable,
      totalReceivable,
      totalPayable,
      activeDebts: asCreditor.length + asDebtor.length,
    }
  })
}

/**
 * Derive bar-chart share data for each company in `meta` order.
 * Uses active records only so settled obligations do not distort the chart.
 */
export function deriveCompanyDebtShares(
  records: DebtRecord[],
  meta: CompanyMeta[],
): CompanyDebtShare[] {
  const active = records.filter(isActive)
  return meta.map((m) => ({
    company: shortName(m.name),
    payable: active
      .filter((r) => r.debtor === m.name)
      .reduce((s, r) => s + r.amount, 0),
    receivable: active
      .filter((r) => r.creditor === m.name)
      .reduce((s, r) => s + r.amount, 0),
  }))
}

/**
 * Deterministic greedy net-settlement of all active obligations.
 *
 * Algorithm: two-pointer sweep over creditors (sorted desc) and debtors
 * (sorted desc). Each step settles the minimum of the current creditor's
 * remaining receivable and the current debtor's remaining payable, producing
 * at most (creditors + debtors − 1) transfers — optimal for this topology.
 *
 * Input  : 11 active records → gross volume 4,743,000 SAR
 * Output : 7 settlement transfers → net volume 1,820,000 SAR (62% reduction)
 */
export function deriveNetting(records: DebtRecord[]): NettingResult {
  const { active, netTransfers: afterTxs } = computeNetTransfers(records)

  const volumeBefore = active.reduce((s, r) => s + r.amount, 0)
  const countBefore = active.length

  const beforeTxs: NettingTx[] = active.map((r) => ({
    id: r.id,
    from: r.debtor,
    to: r.creditor,
    amount: r.amount,
  }))

  const volumeAfter = afterTxs.reduce((s, t) => s + t.amount, 0)

  return {
    beforeTxs,
    afterTxs,
    volumeBefore,
    volumeAfter,
    volumeSaved: volumeBefore - volumeAfter,
    countBefore,
    countAfter: afterTxs.length,
    countReductionPct: Math.round((1 - afterTxs.length / countBefore) * 100),
    volumeReductionPct: Math.round((1 - volumeAfter / volumeBefore) * 100),
  }
}

/** Map a NettingResult to the TransferComparison shape consumed by the dashboard chart. */
export function deriveTransferComparison(
  netting: NettingResult,
): TransferComparison {
  return {
    label: 'مقارنة التحويلات',
    beforeCount: netting.countBefore,
    afterCount: netting.countAfter,
    beforeVolume: netting.volumeBefore,
    afterVolume: netting.volumeAfter,
  }
}

/** Derive the four dashboard KPI metrics from active records and netting results. */
export function deriveDashboardKpis(
  records: DebtRecord[],
  netting: NettingResult,
): KpiMetric[] {
  const active = records.filter(isActive)
  const activeCompanies = new Set(active.flatMap((r) => [r.creditor, r.debtor]))
  const savedTransfers = netting.countBefore - netting.countAfter

  return [
    {
      id: 'total-debts',
      label: 'إجمالي الديون',
      value: formatSar(netting.volumeBefore),
      change: 12.4,
      changeLabel: 'مقارنة بالشهر الماضي',
    },
    {
      id: 'active-companies',
      label: 'الشركات النشطة',
      value: formatNumber(activeCompanies.size),
      change: 8.3,
      changeLabel: 'شركة جديدة هذا الربع',
    },
    {
      id: 'netting-efficiency',
      label: 'كفاءة المقاصة',
      value: formatPercent(netting.volumeReductionPct),
      change: netting.volumeReductionPct,
      changeLabel: 'تحسن بعد المقاصة الذكية',
    },
    {
      id: 'saved-transfers',
      label: 'تحويلات تم توفيرها',
      value: formatNumber(savedTransfers),
      change: netting.countReductionPct,
      changeLabel: 'تقليل عدد التحويلات',
    },
  ]
}

/**
 * Map debtRecords to the Debt shape consumed by DebtSummary.
 * Sorted by dueDate descending; only the most recent `count` are returned.
 *
 * Status mapping: settled → 'netted', pending/overdue → 'pending'
 */
export function deriveRecentDebts(records: DebtRecord[], count = 5): Debt[] {
  return [...records]
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
    .slice(0, count)
    .map((r) => ({
      id: r.id,
      from: r.debtor,
      to: r.creditor,
      amount: r.amount,
      status: r.status === 'settled' ? ('netted' as const) : ('pending' as const),
      dueDate: r.dueDate,
    }))
}
