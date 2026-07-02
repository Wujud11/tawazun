export type DebtStatus = 'pending' | 'netted' | 'partial'

export type Debt = {
  id: string
  from: string
  to: string
  amount: number
  status: DebtStatus
  dueDate: string
}

export type Company = {
  id: string
  name: string
  nameEn: string
  sector: string
  netBalance: number
  totalPayable: number
  totalReceivable: number
  activeDebts: number
}

export type ActivityType =
  | 'netting'
  | 'transfer'
  | 'analysis'
  | 'settlement'

export type Activity = {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: string
  amount?: number
}

export type KpiMetric = {
  id: string
  label: string
  value: string
  change: number
  changeLabel: string
}

export type TransferComparison = {
  label: string
  beforeCount: number
  afterCount: number
  beforeVolume: number
  afterVolume: number
}

export type ChartDataPoint = {
  month: string
  grossVolume: number
  nettedVolume: number
  savings: number
}

export type CompanyDebtShare = {
  company: string
  payable: number
  receivable: number
}
