import type {
  CreateNettingSessionInput,
  NettingSession,
  NettingSessionService,
} from './types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Frontend-only mock of a Treasury settlement-session service.
 *
 * Later replacements (ERP / Open Banking / real approval APIs) should implement
 * the same `NettingSessionService` contract — UI stays unchanged.
 */
export class MockNettingSessionService implements NettingSessionService {
  private sequence = 0

  async createSession(
    input: CreateNettingSessionInput,
  ): Promise<NettingSession> {
    this.sequence += 1
    const id = `NET-2026-${String(this.sequence).padStart(3, '0')}`

    // Brief prepare latency to feel like session provisioning.
    await delay(450)

    const now = new Date().toISOString()

    return {
      id,
      title: 'جلسة المقاصة',
      statusLabel: 'جاري تجهيز جلسة المقاصة',
      phase: 'preparing',
      createdAt: now,
      participants: input.companies.map((company) => ({
        companyId: company.id,
        companyName: company.name,
        companyNameEn: company.nameEn,
        status: 'pending',
      })),
    }
  }

  watchApprovals(
    session: NettingSession,
    onUpdate: (next: NettingSession) => void,
  ): () => void {
    let cancelled = false
    let working: NettingSession = {
      ...session,
      phase: 'notifying',
      statusLabel: 'جاري إشعار الشركات المشاركة',
      participants: session.participants.map((p) => ({ ...p })),
    }

    onUpdate(working)

    void (async () => {
      // Notify wave
      await delay(randomBetween(500, 700))
      if (cancelled) return

      working = {
        ...working,
        phase: 'awaiting_approvals',
        statusLabel: 'بانتظار اعتماد الشركات',
        participants: working.participants.map((p) => ({
          ...p,
          notifiedAt: new Date().toISOString(),
        })),
      }
      onUpdate(working)

      for (let i = 0; i < working.participants.length; i += 1) {
        await delay(randomBetween(500, 700))
        if (cancelled) return

        const decidedAt = new Date().toISOString()
        working = {
          ...working,
          participants: working.participants.map((p, idx) =>
            idx === i
              ? { ...p, status: 'approved', decidedAt }
              : p,
          ),
        }

        const approvedCount = working.participants.filter(
          (p) => p.status === 'approved',
        ).length
        const total = working.participants.length
        const allApproved = approvedCount === total

        working = {
          ...working,
          phase: allApproved ? 'ready_to_execute' : 'awaiting_approvals',
          statusLabel: allApproved
            ? 'جاهزة لتنفيذ المقاصة'
            : `اعتماد الشركات (${approvedCount} / ${total})`,
        }
        onUpdate(working)
      }
    })()

    return () => {
      cancelled = true
    }
  }
}
