/**
 * Single source of truth for all frontend demo / presentation data.
 *
 * Every Dashboard, Companies, Netting, Workflow, chart, KPI, and summary
 * widget must import from this module — not from ad-hoc local literals.
 *
 * Operational debt rows used only by the AI/netting API payload remain in
 * `debts-mock.ts` and must not drive UI KPIs.
 */

import type {
  Activity,
  ChartDataPoint,
  Company,
  CompanyDebtShare,
  Debt,
} from '@/types/dashboard'
import type {
  SettlementOpportunity,
  WorkflowNotification,
  WorkflowStep,
} from '@/types/workflow'

// ─── Canonical portfolio metrics ─────────────────────────────────────────────

export const demoPortfolio = {
  participatingCompanies: 384,
  financialRelationships: 5_240,
  grossDebtSar: 24_800_000,
  netSettlementSar: 7_140_000,
  /** Released liquidity / expected savings */
  savingsSar: 17_660_000,
  savingsPct: 71,
  transfersBefore: 720,
  transfersAfter: 168,
  transferReductionPct: 77,
  activeCycles: 12,
  markets: 4,
} as const

/** @deprecated Prefer `demoPortfolio` — kept as alias during import migration. */
export const enterprisePortfolioScale = demoPortfolio

export const DEMO_DATA_DISCLAIMER_AR =
  'بيانات تجريبية على نطاق مؤسسي — للعرض التقديمي فقط'

export const DEMO_DATA_DISCLAIMER_EN = 'Enterprise-scale demo metrics (mock)'

export const SAMPLE_PARTICIPANTS_LABEL_AR = 'عرض عينة من الشركات المشاركة'
export const SAMPLE_PARTICIPANTS_LABEL_EN = 'Sample Participants'
export const SAMPLE_PARTICIPANT_COUNT = 6

// ─── Sample companies (interactive UI — 6 of the portfolio) ──────────────────

type SampleCompanySeed = {
  id: string
  name: string
  nameEn: string
  sector: string
  shortLabel: string
  payable: number
  receivable: number
  activeDebts: number
}

const sampleCompanySeeds: SampleCompanySeed[] = [
  {
    id: 'c1',
    name: 'شركة ألف للتجارة',
    nameEn: 'Alif Trading Co.',
    sector: 'تجارة',
    shortLabel: 'ألف',
    payable: 3_450_000,
    receivable: 4_120_000,
    activeDebts: 18,
  },
  {
    id: 'c2',
    name: 'شركة باء القابضة',
    nameEn: 'Ba Holding',
    sector: 'استثمار',
    shortLabel: 'باء',
    payable: 4_980_000,
    receivable: 2_760_000,
    activeDebts: 22,
  },
  {
    id: 'c3',
    name: 'شركة جيم للمقاولات',
    nameEn: 'Jim Contracting',
    sector: 'مقاولات',
    shortLabel: 'جيم',
    payable: 2_210_000,
    receivable: 3_890_000,
    activeDebts: 15,
  },
  {
    id: 'c4',
    name: 'شركة دال للخدمات',
    nameEn: 'Dal Services',
    sector: 'خدمات',
    shortLabel: 'دال',
    payable: 1_870_000,
    receivable: 2_540_000,
    activeDebts: 11,
  },
  {
    id: 'c5',
    name: 'شركة هـ للتمويل',
    nameEn: 'Ha Finance',
    sector: 'تمويل',
    shortLabel: 'هاء',
    payable: 3_120_000,
    receivable: 1_650_000,
    activeDebts: 14,
  },
  {
    id: 'c6',
    name: 'شركة واو للتوريد',
    nameEn: 'Waw Supply',
    sector: 'توريد',
    shortLabel: 'واو',
    payable: 2_640_000,
    receivable: 3_010_000,
    activeDebts: 16,
  },
]

export const demoCompanies: Company[] = sampleCompanySeeds.map((c) => ({
  id: c.id,
  name: c.name,
  nameEn: c.nameEn,
  sector: c.sector,
  totalPayable: c.payable,
  totalReceivable: c.receivable,
  netBalance: c.receivable - c.payable,
  activeDebts: c.activeDebts,
}))

/** Interactive sample — always the first N companies. */
export const demoSampleCompanies = demoCompanies.slice(
  0,
  SAMPLE_PARTICIPANT_COUNT,
)

export const demoSampleCompanyNames = demoSampleCompanies.map((c) => c.name)

// ─── Charts ──────────────────────────────────────────────────────────────────

export const demoCompanyDebtShares: CompanyDebtShare[] = sampleCompanySeeds.map(
  (c) => ({
    company: c.shortLabel,
    payable: c.payable,
    receivable: c.receivable,
  }),
)

/** @deprecated Prefer `demoCompanyDebtShares`. */
export const enterpriseCompanyDebtShares = demoCompanyDebtShares

export const demoMonthlyTrend: ChartDataPoint[] = [
  {
    month: 'يناير',
    grossVolume: 18_400_000,
    nettedVolume: 6_900_000,
    savings: 11_500_000,
  },
  {
    month: 'فبراير',
    grossVolume: 19_200_000,
    nettedVolume: 7_100_000,
    savings: 12_100_000,
  },
  {
    month: 'مارس',
    grossVolume: 21_500_000,
    nettedVolume: 7_400_000,
    savings: 14_100_000,
  },
  {
    month: 'أبريل',
    grossVolume: 20_800_000,
    nettedVolume: 6_850_000,
    savings: 13_950_000,
  },
  {
    month: 'مايو',
    grossVolume: 22_600_000,
    nettedVolume: 7_050_000,
    savings: 15_550_000,
  },
  {
    month: 'يونيو',
    grossVolume: demoPortfolio.grossDebtSar,
    nettedVolume: demoPortfolio.netSettlementSar,
    savings: demoPortfolio.savingsSar,
  },
]

/** @deprecated Prefer `demoMonthlyTrend`. */
export const enterpriseMonthlyTrend = demoMonthlyTrend

// ─── Debt / activity summaries (presentation sample) ─────────────────────────

export const demoRecentDebts: Debt[] = [
  {
    id: 'd1',
    from: 'شركة باء القابضة',
    to: 'شركة ألف للتجارة',
    amount: 3_450_000,
    status: 'pending',
    dueDate: '2026-07-15',
  },
  {
    id: 'd2',
    from: 'شركة جيم للمقاولات',
    to: 'شركة باء القابضة',
    amount: 2_760_000,
    status: 'pending',
    dueDate: '2026-07-20',
  },
  {
    id: 'd3',
    from: 'شركة دال للخدمات',
    to: 'شركة ألف للتجارة',
    amount: 1_870_000,
    status: 'partial',
    dueDate: '2026-06-10',
  },
  {
    id: 'd4',
    from: 'شركة هـ للتمويل',
    to: 'شركة واو للتوريد',
    amount: 2_640_000,
    status: 'pending',
    dueDate: '2026-07-25',
  },
  {
    id: 'd5',
    from: 'شركة واو للتوريد',
    to: 'شركة جيم للمقاولات',
    amount: 2_210_000,
    status: 'netted',
    dueDate: '2026-07-08',
  },
]

/** Sample ledger rows for the Debts page (presentation amounts). */
export const demoDebtLedger = demoRecentDebts.map((d, i) => ({
  id: `dl-${i + 1}`,
  creditor: d.to,
  debtor: d.from,
  amount: d.amount,
  currency: 'SAR',
  dueDate: d.dueDate,
  status:
    d.status === 'netted'
      ? ('settled' as const)
      : d.status === 'partial'
        ? ('overdue' as const)
        : ('pending' as const),
}))

export const demoDebtCompanyNames: string[] = Array.from(
  new Set(demoDebtLedger.flatMap((d) => [d.creditor, d.debtor])),
).sort()

export const demoRecentActivity: Activity[] = [
  {
    id: 'a1',
    type: 'netting',
    title: 'اكتملت دورة مقاصة مؤسسية',
    description:
      'بيانات تجريبية: إغلاق دفعة تحويلات عبر شبكة واسعة من الأطراف',
    timestamp: '2026-06-29T09:42:00',
    amount: demoPortfolio.savingsSar,
  },
  {
    id: 'a2',
    type: 'analysis',
    title: 'تحليل AI للمحفظة',
    description: 'رصد فرص مقاصة إضافية ضمن آلاف العلاقات المالية التجريبية',
    timestamp: '2026-06-29T08:15:00',
  },
  {
    id: 'a3',
    type: 'transfer',
    title: 'تحويلات مجدولة',
    description: 'دفعة تسوية مجدولة — بانتظار اعتماد الخزينة',
    timestamp: '2026-06-28T16:30:00',
    amount: demoPortfolio.netSettlementSar,
  },
  {
    id: 'a4',
    type: 'settlement',
    title: 'تسوية قطاعية مكتملة',
    description: 'إغلاق مجموعة التزامات داخل قطاع الخدمات والتمويل',
    timestamp: '2026-06-28T11:05:00',
    amount: 1_180_000,
  },
  {
    id: 'a5',
    type: 'netting',
    title: 'مقاصة مرحلية',
    description: 'تخفيض حجم التحويلات في شريحة تجارة/مقاولات',
    timestamp: '2026-06-27T14:20:00',
    amount: 4_550_000,
  },
  {
    id: 'a6',
    type: 'analysis',
    title: 'تقرير أسبوعي',
    description: `تحسن كفاءة المقاصة ${demoPortfolio.savingsPct}% مقارنة بالأسبوع السابق (تجريبي)`,
    timestamp: '2026-06-27T09:00:00',
  },
]

// ─── Workflow ────────────────────────────────────────────────────────────────

export const PRIMARY_OPPORTUNITY_ID = 'opp-cycle-2026-06'

export const settlementWorkflowSteps: WorkflowStep[] = [
  { id: 'notification', label: 'الإشعار', shortLabel: 'إشعار' },
  { id: 'opportunity', label: 'مراجعة الفرصة', shortLabel: 'مراجعة' },
  { id: 'approvals', label: 'موافقات الشركات', shortLabel: 'موافقات' },
  { id: 'execution', label: 'تنفيذ التسوية', shortLabel: 'تنفيذ' },
  { id: 'report', label: 'التقرير التنفيذي', shortLabel: 'تقرير' },
]

export const settlementOpportunities: SettlementOpportunity[] = [
  {
    id: PRIMARY_OPPORTUNITY_ID,
    title: 'دورة مقاصة متعددة الأطراف — يونيو 2026',
    companies: [...demoSampleCompanyNames],
    companyCount: demoPortfolio.participatingCompanies,
    grossAmount: demoPortfolio.grossDebtSar,
    netAmount: demoPortfolio.netSettlementSar,
    transfersBefore: demoPortfolio.transfersBefore,
    transfersAfter: demoPortfolio.transfersAfter,
    savings: demoPortfolio.savingsSar,
    savingsPct: demoPortfolio.savingsPct,
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
]

export const workflowNotifications: WorkflowNotification[] = [
  {
    id: 'n1',
    kind: 'opportunity',
    title: 'فرصة تسوية جديدة',
    description: `تم رصد دورة مقاصة مؤسسية تجريبية عبر ${demoPortfolio.participatingCompanies} شركة — توفير متوقع نحو ${(demoPortfolio.savingsSar / 1_000_000).toFixed(1)}M ريال (${demoPortfolio.savingsPct}%).`,
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
