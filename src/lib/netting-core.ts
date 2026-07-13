/**
 * Single source of truth for the multi-party net-settlement algorithm.
 *
 * Imported by both the frontend (src/lib/derive.ts) and the backend
 * (server/lib/derive.ts) so both sides always run identical arithmetic.
 * No external imports — this file must remain self-contained.
 */

/** Minimal record shape required by the netting algorithm. */
export type NettingRecord = {
  creditor: string
  debtor: string
  amount: number
  status: string
}

/** One optimised settlement transfer produced by the netting algorithm. */
export type NettingTx = {
  id: string
  /** Net payer */
  from: string
  /** Net receiver */
  to: string
  amount: number
}

/**
 * Greedy two-pointer net-settlement algorithm.
 *
 * 1. Filters out settled records.
 * 2. Computes net balance per company (creditor = positive, debtor = negative).
 * 3. Sorts creditors and debtors by descending absolute balance.
 * 4. Sweeps both queues, settling min(cred, debt) each step.
 *
 * Input  : 11 active records → gross volume 4,743,000 SAR
 * Output : 7 settlement transfers → net volume 1,820,000 SAR (62% reduction)
 *
 * Returns: active records, the net-transfer list, and the balance map so
 * callers can compute additional metrics without re-iterating.
 */
export function computeNetTransfers<R extends NettingRecord>(records: R[]): {
  active: R[]
  netTransfers: NettingTx[]
  balanceMap: Map<string, number>
} {
  const active = records.filter((r) => r.status !== 'settled')

  const balanceMap = new Map<string, number>()
  for (const r of active) {
    balanceMap.set(r.creditor, (balanceMap.get(r.creditor) ?? 0) + r.amount)
    balanceMap.set(r.debtor, (balanceMap.get(r.debtor) ?? 0) - r.amount)
  }

  const creds = [...balanceMap.entries()]
    .filter(([, b]) => b > 0)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)

  const debts = [...balanceMap.entries()]
    .filter(([, b]) => b < 0)
    .map(([name, amount]) => ({ name, amount: -amount }))
    .sort((a, b) => b.amount - a.amount)

  const netTransfers: NettingTx[] = []
  let txId = 1
  let ci = 0
  let di = 0

  while (ci < creds.length && di < debts.length) {
    const cred = creds[ci]
    const debt = debts[di]
    const amount = Math.min(cred.amount, debt.amount)
    netTransfers.push({ id: `n${txId++}`, from: debt.name, to: cred.name, amount })
    cred.amount -= amount
    debt.amount -= amount
    if (cred.amount === 0) ci++
    if (debt.amount === 0) di++
  }

  return { active, netTransfers, balanceMap }
}
