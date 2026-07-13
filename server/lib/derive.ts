import { computeNetTransfers } from '../../src/lib/netting-core.js'

// ─── Input types ──────────────────────────────────────────────────────────────

export type DebtRecordStatus = 'pending' | 'overdue' | 'settled'

export type DebtRecord = {
  id: string
  creditor: string
  debtor: string
  amount: number
  currency: string
  dueDate: string
  status: DebtRecordStatus
}

// ─── Output types ─────────────────────────────────────────────────────────────

export type NetTransfer = {
  id: string
  from: string
  to: string
  amount: number
  /** Gross bilateral obligations between from↔to minus the net transfer amount. */
  bilateralSavings: number
}

export type CompanyBalance = {
  name: string
  grossReceivable: number
  grossPayable: number
  netBalance: number
}

export type ComputedMetrics = {
  grossVolume: number
  netVolume: number
  savings: number
  efficiencyPct: number
  recommendedTransactions: number
  overdueCount: number
  overdueVolume: number
}

export type NettingComputation = {
  metrics: ComputedMetrics
  netTransfers: NetTransfer[]
  companyBalances: CompanyBalance[]
}

// ─── Algorithm ────────────────────────────────────────────────────────────────

/**
 * Computes all deterministic netting metrics for the given debt records.
 * The greedy two-pointer settlement is delegated to the shared
 * src/lib/netting-core.ts module so frontend and backend always run the
 * exact same algorithm from the exact same source file.
 */
export function computeNetting(records: DebtRecord[]): NettingComputation {
  const { active, netTransfers: rawTransfers } = computeNetTransfers(records)

  const grossVolume = active.reduce((s, r) => s + r.amount, 0)

  const overdueRecords = active.filter((r) => r.status === 'overdue')
  const overdueCount = overdueRecords.length
  const overdueVolume = overdueRecords.reduce((s, r) => s + r.amount, 0)

  // ── Bilateral savings per net transfer ────────────────────────────────────
  // For each net transfer A → B, bilateral gross = sum of all active obligations
  // between A and B in both directions. Savings = bilateralGross − netAmount.
  const netTransfers: NetTransfer[] = rawTransfers.map((tx) => {
    const bilateralGross = active
      .filter(
        (r) =>
          (r.debtor === tx.from && r.creditor === tx.to) ||
          (r.debtor === tx.to && r.creditor === tx.from),
      )
      .reduce((s, r) => s + r.amount, 0)

    return {
      ...tx,
      bilateralSavings: Math.max(0, bilateralGross - tx.amount),
    }
  })

  // ── Per-company balance summary ────────────────────────────────────────────
  const companyNames = Array.from(
    new Set(active.flatMap((r) => [r.creditor, r.debtor])),
  )
  const companyBalances: CompanyBalance[] = companyNames
    .map((name) => {
      const grossReceivable = active
        .filter((r) => r.creditor === name)
        .reduce((s, r) => s + r.amount, 0)
      const grossPayable = active
        .filter((r) => r.debtor === name)
        .reduce((s, r) => s + r.amount, 0)
      return { name, grossReceivable, grossPayable, netBalance: grossReceivable - grossPayable }
    })
    .sort((a, b) => b.netBalance - a.netBalance)

  const netVolume = netTransfers.reduce((s, t) => s + t.amount, 0)
  const savings = grossVolume - netVolume
  const efficiencyPct =
    grossVolume > 0 ? Math.round((1 - netVolume / grossVolume) * 100) : 0

  return {
    metrics: {
      grossVolume,
      netVolume,
      savings,
      efficiencyPct,
      recommendedTransactions: netTransfers.length,
      overdueCount,
      overdueVolume,
    },
    netTransfers,
    companyBalances,
  }
}
