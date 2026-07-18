/**
 * Single source of truth for all frontend demo / presentation data.
 *
 * Every Dashboard, Companies, Netting, Workflow, chart, KPI, and summary
 * widget imports from this module. All numeric KPIs are produced by running
 * the generated enterprise dataset through computeNetting() — see
 * `npm run demo:generate` and docs/enterprise-demo-validation.md.
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
import {
  enterpriseCompanies,
  enterpriseComputed,
  enterprisePortfolio,
} from '@/data/generated'

// ─── Canonical portfolio metrics (from computeNetting) ───────────────────────

export const demoPortfolio = {
  participatingCompanies: enterprisePortfolio.participatingCompanies,
  financialRelationships: enterprisePortfolio.financialRelationships,
  grossDebtSar: enterprisePortfolio.grossDebtSar,
  netSettlementSar: enterprisePortfolio.netSettlementSar,
  savingsSar: enterprisePortfolio.savingsSar,
  savingsPct: enterprisePortfolio.savingsPct,
  transfersBefore: enterprisePortfolio.transfersBefore,
  transfersAfter: enterprisePortfolio.transfersAfter,
  transferReductionPct: enterprisePortfolio.transferReductionPct,
  activeCycles: enterprisePortfolio.activeCycles,
  markets: enterprisePortfolio.markets,
  overdueCount: enterprisePortfolio.overdueCount,
  overdueVolumeSar: enterprisePortfolio.overdueVolumeSar,
} as const

/** @deprecated Prefer `demoPortfolio` — kept as alias during import migration. */
export const enterprisePortfolioScale = demoPortfolio

export const DEMO_DATA_DISCLAIMER_AR =
  'بيانات مؤسسةسية محسوبة بخوارزمية المقاصة من مجموعة البيانات التجريبية'

export const DEMO_DATA_DISCLAIMER_EN =
  'Enterprise demo metrics computed via computeNetting() on the generated dataset'

export const SAMPLE_PARTICIPANTS_LABEL_AR = 'عرض عينة من الشركات المشاركة'
export const SAMPLE_PARTICIPANTS_LABEL_EN = 'Sample Participants'
export const SAMPLE_PARTICIPANT_COUNT = 6

// ─── Companies (balances derived from active debt records) ───────────────────

export const demoCompanies: Company[] = enterpriseCompanies.map((c) => ({
  id: c.id,
  name: c.name,
  nameEn: c.nameEn,
  sector: c.sector,
  totalPayable: c.totalPayable,
  totalReceivable: c.totalReceivable,
  netBalance: c.netBalance,
  activeDebts: c.activeDebts,
}))

const sampleIds = new Set(enterpriseComputed.sampleCompanyIds)

/** Interactive sample — largest counterparties by gross exposure. */
export const demoSampleCompanies = demoCompanies
  .filter((c) => sampleIds.has(c.id))
  .slice(0, SAMPLE_PARTICIPANT_COUNT)

export const demoSampleCompanyNames = demoSampleCompanies.map((c) => c.name)

// ─── Charts (monthly points from computeNetting on dueDate slices) ───────────

export const demoCompanyDebtShares: CompanyDebtShare[] =
  enterpriseComputed.companyDebtShares

/** @deprecated Prefer `demoCompanyDebtShares`. */
export const enterpriseCompanyDebtShares = demoCompanyDebtShares

export const demoMonthlyTrend: ChartDataPoint[] = enterpriseComputed.monthlyTrend

/** @deprecated Prefer `demoMonthlyTrend`. */
export const enterpriseMonthlyTrend = demoMonthlyTrend

// ─── Debt / activity summaries ───────────────────────────────────────────────

export const demoRecentDebts: Debt[] = enterpriseComputed.recentDebts.map(
  (d) => ({
    id: d.id,
    from: d.from,
    to: d.to,
    amount: d.amount,
    status: d.status as Debt['status'],
    dueDate: d.dueDate,
  }),
)

/** Ledger rows for the Debts page (sample of full dataset; KPIs use full portfolio). */
export const demoDebtLedger = enterpriseComputed.debtLedger.map((d) => ({
  id: d.id,
  creditor: d.creditor,
  debtor: d.debtor,
  amount: d.amount,
  currency: d.currency,
  dueDate: d.dueDate,
  status: d.status as 'pending' | 'overdue' | 'settled',
}))

export const demoDebtCompanyNames: string[] = Array.from(
  new Set(demoDebtLedger.flatMap((d) => [d.creditor, d.debtor])),
).sort()

/** Before/after transfer samples for Netting panels (counts come from portfolio). */
export const demoBeforeTransferSample = enterpriseComputed.beforeTransferSample
export const demoAfterTransferSample = enterpriseComputed.afterTransferSample

/** Full net-transfer list from computeNetting (for local analysis without AI). */
export const demoNetTransfers = enterpriseComputed.netTransfers

export const demoRecentActivity: Activity[] = [
  {
    id: 'a1',
    type: 'netting',
    title: 'اكتملت دورة مقاصة مؤسسية',
    description: `إغلاق شبكة ${demoPortfolio.participatingCompanies} شركة و${demoPortfolio.financialRelationships.toLocaleString('en-US')} علاقة مالية`,
    timestamp: '2026-06-29T09:42:00',
    amount: demoPortfolio.savingsSar,
  },
  {
    id: 'a2',
    type: 'analysis',
    title: 'تحليل المحفظة بخوارزمية المقاصة',
    description: `تخفيض الحجم ${demoPortfolio.savingsPct}% — من ${demoPortfolio.transfersBefore} إلى ${demoPortfolio.transfersAfter} تحويل`,
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
    description: 'إغلاق مجموعة التزامات داخل قطاعات الشبكة التجريبية',
    timestamp: '2026-06-28T11:05:00',
    amount: demoAfterTransferSample[0]?.amount,
  },
  {
    id: 'a5',
    type: 'netting',
    title: 'مقاصة مرحلية',
    description: 'إعادة حساب الأرصدة الصافية عبر الدورة المؤسسية',
    timestamp: '2026-06-27T14:20:00',
    amount: demoPortfolio.savingsSar,
  },
  {
    id: 'a6',
    type: 'analysis',
    title: 'تقرير التحقق',
    description: `تحسن كفاءة المقاصة ${demoPortfolio.savingsPct}% مع حفظ إجمالي الأرصدة (Σ = 0)`,
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

const sampleApprovals = demoSampleCompanies.map((c, i) => {
  const statuses = ['approved', 'approved', 'pending', 'pending', 'approved', 'rejected'] as const
  const status = statuses[i % statuses.length]!
  return {
    id: `ap-${i + 1}`,
    companyName: c.name,
    companyNameEn: c.nameEn,
    role: 'both' as const,
    status,
    decidedAt:
      status === 'pending' ? undefined : `2026-06-29T0${8 + i}:40:00`,
    note:
      status === 'approved'
        ? 'موافقة الخزينة'
        : status === 'rejected'
          ? 'طلب تأجيل لدورة لاحقة — يمكن إعادة التقديم'
          : 'بانتظار توقيع المدير المالي',
  }
})

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
    summary: `محفظة مؤسسية محسوبة: ${demoPortfolio.participatingCompanies} شركة، ${demoPortfolio.financialRelationships.toLocaleString('en-US')} علاقة مالية. المؤشرات من computeNetting() — إجمالي ${demoPortfolio.grossDebtSar.toLocaleString('en-US')} ر.س، صافي ${demoPortfolio.netSettlementSar.toLocaleString('en-US')} ر.س، توفير ${demoPortfolio.savingsPct}%.`,
    approvals: sampleApprovals,
  },
]

export const workflowNotifications: WorkflowNotification[] = [
  {
    id: 'n1',
    kind: 'opportunity',
    title: 'فرصة تسوية جديدة',
    description: `تم رصد دورة مقاصة عبر ${demoPortfolio.participatingCompanies} شركة — توفير ${(demoPortfolio.savingsSar / 1_000_000).toFixed(1)}M ريال (${demoPortfolio.savingsPct}%).`,
    timestamp: '2026-06-29T08:05:00',
    unread: true,
    opportunityId: PRIMARY_OPPORTUNITY_ID,
  },
  {
    id: 'n2',
    kind: 'approval',
    title: 'موافقات معلّقة',
    description:
      'بانتظار اعتماد عيّنة من الشركات المشاركة قبل تنفيذ الدورة.',
    timestamp: '2026-06-29T09:30:00',
    unread: true,
    opportunityId: PRIMARY_OPPORTUNITY_ID,
  },
  {
    id: 'n3',
    kind: 'execution',
    title: 'جاهزية التنفيذ',
    description: `جاهز لتنفيذ ${demoPortfolio.transfersAfter} تحويل صافٍ بدل ${demoPortfolio.transfersBefore}.`,
    timestamp: '2026-06-29T09:45:00',
    unread: false,
    opportunityId: PRIMARY_OPPORTUNITY_ID,
  },
  {
    id: 'n4',
    kind: 'report',
    title: 'التقرير التنفيذي جاهز للمعاينة',
    description:
      'المؤشرات مطابقة لمخرجات خوارزمية المقاصة — يمكن تصدير التقرير PDF.',
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
