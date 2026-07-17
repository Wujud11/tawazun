import { MockNettingSessionService } from './mock-netting-session-service'
import type { NettingSessionService } from './types'

/**
 * Single composition root for the session service.
 * Replace the mock with an ERP/Treasury adapter here when integrating later.
 */
let singleton: NettingSessionService | null = null

export function getNettingSessionService(): NettingSessionService {
  if (!singleton) {
    singleton = new MockNettingSessionService()
  }
  return singleton
}

export type {
  CreateNettingSessionInput,
  NettingSession,
  NettingSessionParticipant,
  NettingSessionPhase,
  NettingSessionService,
  ParticipantApprovalStatus,
  TimelineStep,
  TimelineStepId,
  TimelineStepStatus,
} from './types'

export { buildSessionTimeline } from './timeline'
