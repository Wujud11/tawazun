import { enterprisePortfolioScale } from '@/data/enterprise-demo-scale'
import type {
  SettlementOpportunity,
  WorkflowNotification,
  WorkflowStep,
} from '@/types/workflow'

/** Canonical demo opportunity — portfolio-scale presentation metrics (mock UI). */
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
    ],
    companyCount: enterprisePortfolioScale.participatingCompanies,
    grossAmount: enterprisePortfolioScale.grossDebtSar,
    netAmount: enterprisePortfolioScale.netSettlementSar,
    transfersBefore: enterprisePortfolioScale.transfersBefore,
    transfersAfter: enterprisePortfolioScale.transfersAfter,
    savings: enterprisePortfolioScale.savingsSar,
    savingsPct: enterprisePortfolioScale.savingsPct,
    status: 'detected',
    detectedAt: '2026-06-29T08:05:00',
    summary:
      'بيانات تجريبية: شبكة مؤسسية تضم مئات الشركات وآلاف العلاقات المالية. العرض التفصيلي التالي يظهر عينة فقط، بينما مؤشرات المحفظة تعكس نطاقًا أوسع للعرض التقديمي.',
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
    ],
  },
  {
    id: 'opp-partial-alif-ba-jim',
    title: 'فرصة مقاصة قطاعية — مجموعة تجارة ومقاولات',
    companies: [
      'شركة ألف للتجارة',
      'شركة باء القابضة',
      'شركة جيم للمقاولات',
      'شركة دال للخدمات',
      'شركة هـ للتمويل',
      'شركة واو للتوريد',
    ],
    companyCount: 96,
    grossAmount: 6_400_000,
    netAmount: 1_850_000,
    transfersBefore: 210,
    transfersAfter: 48,
    savings: 4_550_000,
    savingsPct: 71,
    status: 'completed',
    detectedAt: '2026-06-27T11:00:00',
    summary:
      'دورة قطاعية مكتملة (بيانات تجريبية) — العرض أدناه عينة من الأطراف، ضمن شبكة أوسع.',
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
      'تم رصد دورة مقاصة مؤسسية تجريبية عبر مئات الشركات — توفير متوقع نحو 17.7M ريال.',
    timestamp: '2026-06-29T08:05:00',
    unread: true,
    opportunityId: PRIMARY_OPPORTUNITY_ID,
  },
  {
    id: 'n2',
    kind: 'approval',
    title: 'موافقات معلّقة',
    description:
      'بانتظار اعتماد عيّنة من الشركات المشاركة قبل تنفيذ دورة العرض.',
    timestamp: '2026-06-29T09:30:00',
    unread: true,
    opportunityId: PRIMARY_OPPORTUNITY_ID,
  },
  {
    id: 'n3',
    kind: 'execution',
    title: 'جاهزية التنفيذ',
    description:
      'يمكن بدء محاكاة تنفيذ التسوية بعد استكمال اعتماد العينة المعروضة.',
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
