/**
 * Presentation-only enterprise demo scale.
 *
 * IMPORTANT: These values are for UI storytelling on the Dashboard / session framing.
 * They do NOT feed the netting algorithm, backend, or AI analysis payload.
 * Operational execution still uses the small deterministic mock debt cycle.
 */

export const DEMO_DATA_DISCLAIMER_AR =
  'بيانات تجريبية على نطاق مؤسسي — للعرض التقديمي فقط'

export const DEMO_DATA_DISCLAIMER_EN = 'Enterprise-scale demo metrics (mock)'

/** Portfolio-scale snapshot used by Dashboard KPIs and comparison widgets. */
export const enterprisePortfolioScale = {
  participatingCompanies: 384,
  financialRelationships: 5_240,
  grossDebtSar: 24_800_000,
  netSettlementSar: 7_140_000,
  savingsSar: 17_660_000,
  savingsPct: 71,
  transfersBefore: 720,
  transfersAfter: 168,
  transferReductionPct: 77,
  activeCycles: 12,
  markets: 4,
} as const

/** Monthly trend chart — cosmetic portfolio history (mock). */
export const enterpriseMonthlyTrend = [
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
    grossVolume: enterprisePortfolioScale.grossDebtSar,
    nettedVolume: enterprisePortfolioScale.netSettlementSar,
    savings: enterprisePortfolioScale.savingsSar,
  },
] as const

/** Top counterparties chart — presentation sample of a large network (mock). */
export const enterpriseCompanyDebtShares = [
  { company: 'ألف', payable: 3_450_000, receivable: 4_120_000 },
  { company: 'باء', payable: 4_980_000, receivable: 2_760_000 },
  { company: 'جيم', payable: 2_210_000, receivable: 3_890_000 },
  { company: 'دال', payable: 1_870_000, receivable: 2_540_000 },
  { company: 'هاء', payable: 3_120_000, receivable: 1_650_000 },
  { company: 'واو', payable: 2_640_000, receivable: 3_010_000 },
  { company: 'زين', payable: 1_980_000, receivable: 2_880_000 },
  { company: 'حاء', payable: 1_420_000, receivable: 1_960_000 },
] as const

export const SAMPLE_PARTICIPANTS_LABEL_AR = 'عرض عينة من الشركات المشاركة'
export const SAMPLE_PARTICIPANTS_LABEL_EN = 'Sample Participants'

/** How many companies to show in the interactive approval sample. */
export const SAMPLE_PARTICIPANT_COUNT = 6
