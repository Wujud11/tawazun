import {
  COUNT_AFTER,
  COUNT_BEFORE,
  VOLUME_AFTER,
  VOLUME_BEFORE,
  VOLUME_REDUCTION_PCT,
  VOLUME_SAVED,
} from '@/data/netting-mock'
import type {
  SettlementOpportunity,
  WorkflowNotification,
  WorkflowStep,
} from '@/types/workflow'

/** Canonical demo opportunity — numbers match the existing netting derivation. */
export const PRIMARY_OPPORTUNITY_ID = 'opp-cycle-2026-06'

export const settlementWorkflowSteps: WorkflowStep[] = [
  {
    id: 'notification',
    label: 'الإشعار',
    shortLabel: 'إشعار',
  },
  {
    id: 'opportunity',
    label: 'مراجعة الفرصة',
    shortLabel: 'مراجعة',
  },
  {
    id: 'approvals',
    label: 'موافقات الشركات',
    shortLabel: 'موافقات',
  },
  {
    id: 'execution',
    label: 'تنفيذ التسوية',
    shortLabel: 'تنفيذ',
  },
  {
    id: 'report',
    label: 'التقرير التنفيذي',
    shortLabel: 'تقرير',
  },
]

export const settlementOpportunities: SettlementOpportunity[] = [
  {
    id: PRIMARY_OPPORTUNITY_ID,
    title: 'دورة مقاصة متعددة الأطراف — يونيو 2026',
    companies: [
      'شركة ألف للتجارة',
      'شركة باء القابضة',
      'شركة جيم للمقاولات',
      'شركة دال للخدمات',
      'شركة هـ للتمويل',
      'شركة واو للتوريد',
      'شركة زين للتطوير',
      'شركة حاء للاستشارات',
    ],
    companyCount: 8,
    grossAmount: VOLUME_BEFORE,
    netAmount: VOLUME_AFTER,
    transfersBefore: COUNT_BEFORE,
    transfersAfter: COUNT_AFTER,
    savings: VOLUME_SAVED,
    savingsPct: VOLUME_REDUCTION_PCT,
    status: 'detected',
    detectedAt: '2026-06-29T08:05:00',
    summary:
      'تم اكتشاف شبكة ديون متقاطعة بين 8 شركات. تطبيق المقاصة متعددة الأطراف يقلّص التحويلات من 11 إلى 7 ويوفّر 2.9M ريال من حجم التسوية.',
    approvals: [
      {
        id: 'ap-1',
        companyName: 'شركة ألف للتجارة',
        companyNameEn: 'Alif Trading Co.',
        role: 'both',
        status: 'approved',
        decidedAt: '2026-06-29T08:40:00',
        note: 'موافقة الخزينة',
      },
      {
        id: 'ap-2',
        companyName: 'شركة باء القابضة',
        companyNameEn: 'Ba Holding',
        role: 'both',
        status: 'approved',
        decidedAt: '2026-06-29T08:55:00',
      },
      {
        id: 'ap-3',
        companyName: 'شركة جيم للمقاولات',
        companyNameEn: 'Jim Contracting',
        role: 'debtor',
        status: 'pending',
        note: 'بانتظار توقيع المدير المالي',
      },
      {
        id: 'ap-4',
        companyName: 'شركة دال للخدمات',
        companyNameEn: 'Dal Services',
        role: 'creditor',
        status: 'pending',
      },
      {
        id: 'ap-5',
        companyName: 'شركة هـ للتمويل',
        companyNameEn: 'Ha Finance',
        role: 'creditor',
        status: 'approved',
        decidedAt: '2026-06-29T09:10:00',
      },
      {
        id: 'ap-6',
        companyName: 'شركة واو للتوريد',
        companyNameEn: 'Waw Supply',
        role: 'debtor',
        status: 'rejected',
        decidedAt: '2026-06-29T09:20:00',
        note: 'طلب تأجيل لدورة يوليو — يمكن إعادة التقديم',
      },
      {
        id: 'ap-7',
        companyName: 'شركة زين للتطوير',
        companyNameEn: 'Zain Development',
        role: 'both',
        status: 'pending',
      },
      {
        id: 'ap-8',
        companyName: 'شركة حاء للاستشارات',
        companyNameEn: 'Haa Consulting',
        role: 'creditor',
        status: 'approved',
        decidedAt: '2026-06-29T09:25:00',
      },
    ],
  },
  {
    id: 'opp-partial-alif-ba-jim',
    title: 'فرصة مقاصة ثلاثية — ألف / باء / جيم',
    companies: [
      'شركة ألف للتجارة',
      'شركة باء القابضة',
      'شركة جيم للمقاولات',
    ],
    companyCount: 3,
    grossAmount: 1_250_000,
    netAmount: 480_000,
    transfersBefore: 5,
    transfersAfter: 2,
    savings: 770_000,
    savingsPct: 62,
    status: 'completed',
    detectedAt: '2026-06-27T11:00:00',
    summary:
      'دورة سابقة اكتملت بنجاح بين ثلاث شركات وحققت تخفيضاً بنسبة 62% في حجم التحويلات.',
    approvals: [
      {
        id: 'ap-p1',
        companyName: 'شركة ألف للتجارة',
        companyNameEn: 'Alif Trading Co.',
        role: 'both',
        status: 'approved',
        decidedAt: '2026-06-27T12:00:00',
      },
      {
        id: 'ap-p2',
        companyName: 'شركة باء القابضة',
        companyNameEn: 'Ba Holding',
        role: 'both',
        status: 'approved',
        decidedAt: '2026-06-27T12:15:00',
      },
      {
        id: 'ap-p3',
        companyName: 'شركة جيم للمقاولات',
        companyNameEn: 'Jim Contracting',
        role: 'debtor',
        status: 'approved',
        decidedAt: '2026-06-27T12:30:00',
      },
    ],
  },
]

export const workflowNotifications: WorkflowNotification[] = [
  {
    id: 'n1',
    kind: 'opportunity',
    title: 'فرصة تسوية جديدة',
    description:
      'تم اكتشاف فرصة مقاصة متعددة الأطراف بين 8 شركات — توفير متوقع 2.9M ريال.',
    timestamp: '2026-06-29T08:05:00',
    unread: true,
    opportunityId: PRIMARY_OPPORTUNITY_ID,
  },
  {
    id: 'n2',
    kind: 'approval',
    title: 'موافقات معلّقة',
    description:
      '3 شركات بانتظار اعتماد دورة المقاصة الحالية قبل التنفيذ.',
    timestamp: '2026-06-29T09:30:00',
    unread: true,
    opportunityId: PRIMARY_OPPORTUNITY_ID,
  },
  {
    id: 'n3',
    kind: 'execution',
    title: 'جاهزية التنفيذ',
    description:
      'يمكن بدء محاكاة تنفيذ التسوية بعد استكمال الموافقات المطلوبة.',
    timestamp: '2026-06-29T09:45:00',
    unread: false,
    opportunityId: PRIMARY_OPPORTUNITY_ID,
  },
  {
    id: 'n4',
    kind: 'report',
    title: 'التقرير التنفيذي جاهز للمعاينة',
    description:
      'بعد اكتمال التحليل يمكن تصدير التقرير التنفيذي بصيغة PDF.',
    timestamp: '2026-06-28T16:00:00',
    unread: false,
    opportunityId: PRIMARY_OPPORTUNITY_ID,
  },
]

export function getOpportunityById(
  id: string,
): SettlementOpportunity | undefined {
  return settlementOpportunities.find((o) => o.id === id)
}

export function getPrimaryOpportunity(): SettlementOpportunity {
  return settlementOpportunities[0]!
}
