/**
 * Netting session domain types.
 *
 * These interfaces describe an enterprise settlement-session lifecycle so the UI
 * can later switch from the mock service to ERP / Open Banking / Treasury APIs
 * without changing presentation components.
 */

export type ParticipantApprovalStatus = 'pending' | 'approved' | 'rejected'

/** High-level session phase used by the timeline and CTA gating. */
export type NettingSessionPhase =
  | 'idle'
  | 'preparing'
  | 'notifying'
  | 'awaiting_approvals'
  | 'ready_to_execute'
  | 'executing'
  | 'report_ready'

export type TimelineStepId =
  | 'data_upload'
  | 'session_create'
  | 'notify_companies'
  | 'approvals'
  | 'execute'
  | 'report'

export type TimelineStepStatus = 'pending' | 'active' | 'done'

export type NettingSessionParticipant = {
  companyId: string
  companyName: string
  companyNameEn: string
  status: ParticipantApprovalStatus
  notifiedAt?: string
  decidedAt?: string
}

export type NettingSession = {
  id: string
  title: string
  statusLabel: string
  phase: NettingSessionPhase
  participants: NettingSessionParticipant[]
  createdAt: string
}

export type CreateNettingSessionInput = {
  companies: Array<{
    id: string
    name: string
    nameEn: string
  }>
}

export type TimelineStep = {
  id: TimelineStepId
  label: string
  status: TimelineStepStatus
}

/**
 * Port for settlement-session orchestration.
 * Swap `MockNettingSessionService` for a real adapter later.
 */
export interface NettingSessionService {
  createSession(input: CreateNettingSessionInput): Promise<NettingSession>

  /**
   * Streams approval updates for a session.
   * Returns an unsubscribe function.
   */
  watchApprovals(
    session: NettingSession,
    onUpdate: (session: NettingSession) => void,
  ): () => void
}
