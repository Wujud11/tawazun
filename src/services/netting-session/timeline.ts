import type {
  NettingSession,
  NettingSessionPhase,
  TimelineStep,
} from './types'

function statusFor(
  currentOrder: number,
  stepOrder: number,
): TimelineStep['status'] {
  if (stepOrder < currentOrder) return 'done'
  if (stepOrder === currentOrder) return 'active'
  return 'pending'
}

function phaseOrder(phase: NettingSessionPhase | 'idle'): number {
  switch (phase) {
    case 'idle':
      // Mock debt data is already loaded — wait on session creation.
      return 1
    case 'preparing':
      return 1
    case 'notifying':
      return 2
    case 'awaiting_approvals':
      return 3
    case 'ready_to_execute':
      return 4
    case 'executing':
      return 4
    case 'report_ready':
      return 5
    default:
      return 1
  }
}

/** Map session phase → FinTech timeline steps for the Netting page. */
export function buildSessionTimeline(
  session: NettingSession | null,
  extras?: { isExecuting?: boolean; reportReady?: boolean },
): TimelineStep[] {
  let phase: NettingSessionPhase | 'idle' = session?.phase ?? 'idle'

  if (extras?.reportReady) phase = 'report_ready'
  else if (extras?.isExecuting) phase = 'executing'

  const current = phaseOrder(phase)

  return [
    {
      id: 'data_upload',
      label: 'رفع البيانات',
      status: statusFor(current, 0),
    },
    {
      id: 'session_create',
      label: 'إنشاء جلسة المقاصة',
      status: statusFor(current, 1),
    },
    {
      id: 'notify_companies',
      label: 'إشعار الشركات',
      status: statusFor(current, 2),
    },
    {
      id: 'approvals',
      label: 'اعتماد جميع الأطراف',
      status: statusFor(current, 3),
    },
    {
      id: 'execute',
      label: 'تنفيذ المقاصة',
      status: statusFor(current, 4),
    },
    {
      id: 'report',
      label: 'التقرير التنفيذي',
      status: statusFor(current, 5),
    },
  ]
}
