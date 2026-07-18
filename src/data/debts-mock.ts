/**
 * Operational debt records for the netting engine / AI API payload.
 *
 * Sourced from the generated enterprise dataset (same rows that produce
 * Dashboard / Netting / Reports KPIs via computeNetting).
 *
 * Regenerate with: npm run demo:generate
 */

import { enterpriseDebtRecords } from '@/data/generated/debt-records'

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

export const debtRecords: DebtRecord[] = enterpriseDebtRecords

export const debtCompanies: string[] = Array.from(
  new Set(debtRecords.flatMap((d) => [d.creditor, d.debtor])),
).sort()
