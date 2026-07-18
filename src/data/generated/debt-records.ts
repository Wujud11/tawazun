/**
 * Full enterprise debt ledger (lazy-loaded).
 * Regenerate with: npm run demo:generate
 */

import debtRecordsJson from './enterprise-debt-records.json'

export type GeneratedDebtRecord = {
  id: string
  creditor: string
  debtor: string
  amount: number
  currency: string
  dueDate: string
  status: 'pending' | 'overdue' | 'settled'
}

export const enterpriseDebtRecords = debtRecordsJson as GeneratedDebtRecord[]
