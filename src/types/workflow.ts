export type NotificationKind =
  | 'opportunity'
  | 'approval'
  | 'execution'
  | 'report'

export type WorkflowNotification = {
  id: string
  kind: NotificationKind
  title: string
  description: string
  timestamp: string
  unread: boolean
  opportunityId: string
}

export type ApprovalStatus = 'approved' | 'pending' | 'rejected'

export type CompanyApproval = {
  id: string
  companyName: string
  companyNameEn: string
  role: 'debtor' | 'creditor' | 'both'
  status: ApprovalStatus
  decidedAt?: string
  note?: string
}

export type SettlementOpportunity = {
  id: string
  title: string
  companies: string[]
  companyCount: number
  grossAmount: number
  netAmount: number
  transfersBefore: number
  transfersAfter: number
  savings: number
  savingsPct: number
  status: 'detected' | 'in_review' | 'awaiting_approvals' | 'ready' | 'completed'
  detectedAt: string
  summary: string
  approvals: CompanyApproval[]
}

export type WorkflowStepId =
  | 'notification'
  | 'opportunity'
  | 'approvals'
  | 'execution'
  | 'report'

export type WorkflowStep = {
  id: WorkflowStepId
  label: string
  shortLabel: string
}
