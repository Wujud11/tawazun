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

export const debtRecords: DebtRecord[] = [
  {
    id: 'dt-01',
    creditor: 'شركة ألف للتجارة',
    debtor: 'شركة باء القابضة',
    amount: 850_000,
    currency: 'SAR',
    dueDate: '2026-07-15',
    status: 'pending',
  },
  {
    id: 'dt-02',
    creditor: 'شركة جيم للمقاولات',
    debtor: 'شركة باء القابضة',
    amount: 620_000,
    currency: 'SAR',
    dueDate: '2026-07-20',
    status: 'pending',
  },
  {
    id: 'dt-03',
    creditor: 'شركة ألف للتجارة',
    debtor: 'شركة جيم للمقاولات',
    amount: 480_000,
    currency: 'SAR',
    dueDate: '2026-06-10',
    status: 'overdue',
  },
  {
    id: 'dt-04',
    creditor: 'شركة باء القابضة',
    debtor: 'شركة دال للخدمات',
    amount: 320_000,
    currency: 'SAR',
    dueDate: '2026-07-25',
    status: 'pending',
  },
  {
    id: 'dt-05',
    creditor: 'شركة واو للتوريد',
    debtor: 'شركة هـ للتمويل',
    amount: 230_000,
    currency: 'SAR',
    dueDate: '2026-07-08',
    status: 'settled',
  },
  {
    id: 'dt-06',
    creditor: 'شركة زين للتطوير',
    debtor: 'شركة ألف للتجارة',
    amount: 175_000,
    currency: 'SAR',
    dueDate: '2026-06-15',
    status: 'overdue',
  },
  {
    id: 'dt-07',
    creditor: 'شركة حاء للاستشارات',
    debtor: 'شركة جيم للمقاولات',
    amount: 490_000,
    currency: 'SAR',
    dueDate: '2026-08-01',
    status: 'pending',
  },
  {
    id: 'dt-08',
    creditor: 'شركة دال للخدمات',
    debtor: 'شركة واو للتوريد',
    amount: 95_000,
    currency: 'SAR',
    dueDate: '2026-05-30',
    status: 'overdue',
  },
  {
    id: 'dt-09',
    creditor: 'شركة باء القابضة',
    debtor: 'شركة زين للتطوير',
    amount: 1_200_000,
    currency: 'SAR',
    dueDate: '2026-08-15',
    status: 'pending',
  },
  {
    id: 'dt-10',
    creditor: 'شركة هـ للتمويل',
    debtor: 'شركة ألف للتجارة',
    amount: 380_000,
    currency: 'SAR',
    dueDate: '2026-06-01',
    status: 'settled',
  },
  {
    id: 'dt-11',
    creditor: 'شركة جيم للمقاولات',
    debtor: 'شركة دال للخدمات',
    amount: 155_000,
    currency: 'SAR',
    dueDate: '2026-07-30',
    status: 'pending',
  },
  {
    id: 'dt-12',
    creditor: 'شركة واو للتوريد',
    debtor: 'شركة باء القابضة',
    amount: 270_000,
    currency: 'SAR',
    dueDate: '2026-06-20',
    status: 'overdue',
  },
  {
    id: 'dt-13',
    creditor: 'شركة ألف للتجارة',
    debtor: 'شركة حاء للاستشارات',
    amount: 540_000,
    currency: 'SAR',
    dueDate: '2026-05-15',
    status: 'settled',
  },
  {
    id: 'dt-14',
    creditor: 'شركة زين للتطوير',
    debtor: 'شركة هـ للتمويل',
    amount: 88_000,
    currency: 'SAR',
    dueDate: '2026-08-20',
    status: 'pending',
  },
]

export const debtCompanies: string[] = Array.from(
  new Set(debtRecords.flatMap((d) => [d.creditor, d.debtor])),
).sort()
