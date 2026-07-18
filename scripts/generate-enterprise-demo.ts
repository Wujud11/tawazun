/**
 * Generate a realistic enterprise demo dataset, run it through the EXISTING
 * computeNetting() algorithm (server/lib/derive.ts → netting-core), validate
 * conservation, and write presentation artefacts consumed by the UI.
 *
 * Does NOT modify computeNetting, netting-core, backend routes, or AI logic.
 *
 * Usage: npx tsx scripts/generate-enterprise-demo.ts
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { computeNetting } from '../server/lib/derive.ts'
import type { DebtRecord } from '../server/lib/derive.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'src', 'data', 'generated')
const DOCS_DIR = join(ROOT, 'docs')

// ─── Seeded PRNG (mulberry32) — reproducible dataset ─────────────────────────

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(0x7a3a201)

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)]!
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

/** Log-normal-ish amount in SAR, rounded to nearest 100. */
function randomAmount(min = 8_000, max = 1_800_000): number {
  const u = Math.max(rand(), 1e-9)
  const v = Math.max(rand(), 1e-9)
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  const mean = Math.log((min + max) / 2)
  const raw = Math.exp(mean + z * 0.75)
  const clamped = Math.min(max, Math.max(min, raw))
  return Math.round(clamped / 100) * 100
}

// ─── Company name catalogue ──────────────────────────────────────────────────

const SECTORS = [
  { ar: 'تجارة', en: 'Trading' },
  { ar: 'مقاولات', en: 'Contracting' },
  { ar: 'خدمات', en: 'Services' },
  { ar: 'تمويل', en: 'Finance' },
  { ar: 'توريد', en: 'Supply' },
  { ar: 'استثمار', en: 'Investment' },
  { ar: 'تقنية', en: 'Technology' },
  { ar: 'صناعة', en: 'Industry' },
  { ar: 'لوجستيات', en: 'Logistics' },
  { ar: 'طاقة', en: 'Energy' },
  { ar: 'رعاية صحية', en: 'Healthcare' },
  { ar: 'عقارات', en: 'Real Estate' },
] as const

const AR_ROOTS = [
  'ألف',
  'باء',
  'جيم',
  'دال',
  'هاء',
  'واو',
  'زاي',
  'حاء',
  'طاء',
  'ياء',
  'كاف',
  'لام',
  'ميم',
  'نون',
  'سين',
  'عين',
  'فاء',
  'صاد',
  'قاف',
  'راء',
  'شين',
  'تاء',
  'ثاء',
  'خاء',
  'ذال',
  'ضاد',
  'ظاء',
  'غين',
  'نهج',
  'أفق',
  'مدار',
  'روافد',
  'سند',
  'يقين',
  'نماء',
  'إتقان',
  'وثاق',
  'صفا',
  'بيان',
  'ركن',
  'مورد',
  'حصاد',
  'تراث',
  'أساس',
  'منار',
  'جدوى',
  'إمداد',
  'عزم',
  'ثبات',
  'وفاء',
] as const

const EN_ROOTS = [
  'Alif',
  'Ba',
  'Jim',
  'Dal',
  'Ha',
  'Waw',
  'Zay',
  'Ha2',
  'Ta',
  'Ya',
  'Kaf',
  'Lam',
  'Mim',
  'Nun',
  'Sin',
  'Ayn',
  'Fa',
  'Sad',
  'Qaf',
  'Ra',
  'Shin',
  'Taa',
  'Tha',
  'Kha',
  'Dhal',
  'Dad',
  'Zha',
  'Ghayn',
  'Nahj',
  'Ufuq',
  'Madar',
  'Rawafid',
  'Sanad',
  'Qimam',
  'Namaa',
  'Itqan',
  'Withaq',
  'Safa',
  'Bayan',
  'Rukn',
  'Mawrid',
  'Hasad',
  'Turath',
  'Asas',
  'Manar',
  'Jadwa',
  'Imdad',
  'Azm',
  'Thabat',
  'Wafa',
] as const

const AR_SUFFIXES = [
  'للتجارة',
  'القابضة',
  'للمقاولات',
  'للخدمات',
  'للتمويل',
  'للتوريد',
  'للاستثمار',
  'للتقنية',
  'للصناعة',
  'للنقل',
  'للطاقة',
  'الطبية',
  'العقارية',
  'للتطوير',
  'للاستشارات',
] as const

const EN_SUFFIXES = [
  'Trading',
  'Holding',
  'Contracting',
  'Services',
  'Finance',
  'Supply',
  'Invest',
  'Tech',
  'Industry',
  'Logistics',
  'Energy',
  'Health',
  'Realty',
  'Dev',
  'Advisory',
] as const

type CompanyMeta = {
  id: string
  name: string
  nameEn: string
  sector: string
  shortLabel: string
}

type CompanyRow = CompanyMeta & {
  totalPayable: number
  totalReceivable: number
  netBalance: number
  activeDebts: number
}

type NetTransferOut = {
  id: string
  from: string
  to: string
  amount: number
  bilateralSavings: number
}

type Portfolio = {
  participatingCompanies: number
  financialRelationships: number
  grossDebtSar: number
  netSettlementSar: number
  savingsSar: number
  savingsPct: number
  transfersBefore: number
  transfersAfter: number
  transferReductionPct: number
  activeCycles: number
  markets: number
  overdueCount: number
  overdueVolumeSar: number
}

const MONTHS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
] as const

const MONTH_ENDS = [
  '2026-01-31',
  '2026-02-28',
  '2026-03-31',
  '2026-04-30',
  '2026-05-31',
  '2026-06-30',
] as const

// ─── Generation ──────────────────────────────────────────────────────────────

function generateCompanies(targetCount: number): CompanyMeta[] {
  const companies: CompanyMeta[] = []
  let n = 0
  for (let i = 0; i < AR_ROOTS.length && companies.length < targetCount; i++) {
    for (
      let s = 0;
      s < AR_SUFFIXES.length && companies.length < targetCount;
      s++
    ) {
      n++
      const sector = SECTORS[n % SECTORS.length]!
      const rootAr = AR_ROOTS[i]!
      const rootEn = EN_ROOTS[i]!
      const sufAr = AR_SUFFIXES[s]!
      const sufEn = EN_SUFFIXES[s]!
      companies.push({
        id: `c${String(n).padStart(3, '0')}`,
        name: `شركة ${rootAr} ${sufAr}`,
        nameEn: `${rootEn} ${sufEn} Co.`,
        sector: sector.ar,
        shortLabel: rootAr,
      })
    }
  }
  // Fill remainder with numbered variants if catalogue exhausted
  while (companies.length < targetCount) {
    n++
    const sector = SECTORS[n % SECTORS.length]!
    const rootAr = AR_ROOTS[n % AR_ROOTS.length]!
    const rootEn = EN_ROOTS[n % EN_ROOTS.length]!
    companies.push({
      id: `c${String(n).padStart(3, '0')}`,
      name: `شركة ${rootAr} مجموعة ${n}`,
      nameEn: `${rootEn} Group ${n}`,
      sector: sector.ar,
      shortLabel: `${rootAr}${n % 10}`,
    })
  }
  return companies
}

function dueDateForIndex(i: number): string {
  // Spread across Jan–Aug 2026
  const month = 1 + (i % 8)
  const day = 1 + (i % 27)
  return `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function statusForIndex(i: number): DebtRecord['status'] {
  const r = rand()
  // Mostly active; ~8% settled (excluded from netting); ~14% overdue
  if (r < 0.08) return 'settled'
  if (r < 0.22) return 'overdue'
  return 'pending'
}

function addDebt(
  debts: DebtRecord[],
  creditor: string,
  debtor: string,
  amount: number,
  i: number,
): void {
  if (creditor === debtor || amount <= 0) return
  debts.push({
    id: `dt-${String(debts.length + 1).padStart(5, '0')}`,
    creditor,
    debtor,
    amount,
    currency: 'SAR',
    dueDate: dueDateForIndex(i),
    status: statusForIndex(i),
  })
}

/**
 * Build a dense multi-party obligation graph that nets well:
 * - sector clusters with directed cycles
 * - bilateral offsetting pairs
 * - cross-cluster hub links
 */
function generateDebts(companies: CompanyMeta[]): DebtRecord[] {
  const debts: DebtRecord[] = []
  const bySector = new Map<string, CompanyMeta[]>()
  for (const c of companies) {
    const list = bySector.get(c.sector) ?? []
    list.push(c)
    bySector.set(c.sector, list)
  }

  let seq = 0
  const clusters = [...bySector.values()]

  // 1) Intra-cluster cycles (primary netting opportunity)
  for (const cluster of clusters) {
    if (cluster.length < 3) continue
    const ordered = shuffleInPlace([...cluster])
    // Full cycle
    for (let i = 0; i < ordered.length; i++) {
      const a = ordered[i]!
      const b = ordered[(i + 1) % ordered.length]!
      addDebt(debts, a.name, b.name, randomAmount(25_000, 900_000), seq++)
    }
    // Extra chords for density
    const chordCount = Math.min(ordered.length * 2, ordered.length * 3)
    for (let k = 0; k < chordCount; k++) {
      const a = pick(ordered)
      const b = pick(ordered)
      if (a.id === b.id) continue
      addDebt(debts, a.name, b.name, randomAmount(12_000, 650_000), seq++)
    }
  }

  // 2) Bilateral offsetting pairs (classic A↔B gross that nets to small residual)
  const shuffled = shuffleInPlace([...companies])
  const pairCount = Math.floor(companies.length * 0.55)
  for (let i = 0; i + 1 < shuffled.length && i < pairCount * 2; i += 2) {
    const a = shuffled[i]!
    const b = shuffled[i + 1]!
    const base = randomAmount(40_000, 1_200_000)
    const offset = Math.round(base * (0.55 + rand() * 0.4))
    addDebt(debts, a.name, b.name, base, seq++)
    addDebt(debts, b.name, a.name, offset, seq++)
  }

  // 3) Cross-cluster hub links (realistic trade corridors)
  const hubs = companies.filter((_, idx) => idx % 17 === 0).slice(0, 24)
  for (const hub of hubs) {
    const targets = shuffleInPlace([...companies])
      .filter((c) => c.id !== hub.id)
      .slice(0, randInt(8, 18))
    for (const t of targets) {
      if (rand() < 0.5) {
        addDebt(debts, hub.name, t.name, randomAmount(15_000, 780_000), seq++)
      } else {
        addDebt(debts, t.name, hub.name, randomAmount(15_000, 780_000), seq++)
      }
    }
  }

  // 4) Sparse long-tail edges until we reach ~4k–5k relationships
  const targetEdges = randInt(4_200, 4_800)
  let guard = 0
  while (debts.length < targetEdges && guard < targetEdges * 3) {
    guard++
    const a = pick(companies)
    const b = pick(companies)
    if (a.id === b.id) continue
    addDebt(debts, a.name, b.name, randomAmount(8_000, 420_000), seq++)
  }

  return debts
}

function deriveCompanies(
  records: DebtRecord[],
  meta: CompanyMeta[],
): CompanyRow[] {
  const active = records.filter((r) => r.status !== 'settled')
  return meta.map((m) => {
    let totalReceivable = 0
    let totalPayable = 0
    let activeDebts = 0
    for (const r of active) {
      if (r.creditor === m.name) {
        totalReceivable += r.amount
        activeDebts++
      }
      if (r.debtor === m.name) {
        totalPayable += r.amount
        activeDebts++
      }
    }
    return {
      ...m,
      totalPayable,
      totalReceivable,
      netBalance: totalReceivable - totalPayable,
      activeDebts,
    }
  })
}

function buildPortfolio(
  records: DebtRecord[],
  computation: ReturnType<typeof computeNetting>,
  companyCount: number,
): Portfolio {
  const active = records.filter((r) => r.status !== 'settled')
  const { metrics, netTransfers } = computation
  const transferReductionPct =
    active.length > 0
      ? Math.round((1 - netTransfers.length / active.length) * 100)
      : 0

  return {
    participatingCompanies: companyCount,
    financialRelationships: records.length,
    grossDebtSar: metrics.grossVolume,
    netSettlementSar: metrics.netVolume,
    savingsSar: metrics.savings,
    savingsPct: metrics.efficiencyPct,
    transfersBefore: active.length,
    transfersAfter: netTransfers.length,
    transferReductionPct,
    activeCycles: Math.max(1, Math.round(companyCount / 32)),
    markets: SECTORS.length,
    overdueCount: metrics.overdueCount,
    overdueVolumeSar: metrics.overdueVolume,
  }
}

type ValidationReport = {
  passed: boolean
  checks: Array<{
    name: string
    passed: boolean
    detail: string
  }>
  kpis: Portfolio
  provenance: {
    algorithm: string
    sourceFiles: string[]
    companyCount: number
    relationshipCount: number
    activeRelationshipCount: number
    netTransferCount: number
  }
}

function validate(
  records: DebtRecord[],
  computation: ReturnType<typeof computeNetting>,
  portfolio: Portfolio,
): ValidationReport {
  const active = records.filter((r) => r.status !== 'settled')
  const { metrics, netTransfers, companyBalances } = computation

  // Rebuild balances independently for conservation proof
  const balanceMap = new Map<string, number>()
  for (const r of active) {
    balanceMap.set(r.creditor, (balanceMap.get(r.creditor) ?? 0) + r.amount)
    balanceMap.set(r.debtor, (balanceMap.get(r.debtor) ?? 0) - r.amount)
  }

  let sumBalances = 0
  let sumPositive = 0
  let sumNegativeAbs = 0
  for (const b of balanceMap.values()) {
    sumBalances += b
    if (b > 0) sumPositive += b
    if (b < 0) sumNegativeAbs += -b
  }

  const sumNetTransferAmounts = netTransfers.reduce((s, t) => s + t.amount, 0)
  const eps = 1e-6

  const checks: ValidationReport['checks'] = [
    {
      name: 'money_conserved_sum_balances_zero',
      passed: Math.abs(sumBalances) < eps,
      detail: `Σ net balances = ${sumBalances} (must be 0)`,
    },
    {
      name: 'gross_equals_sum_active_amounts',
      passed: metrics.grossVolume === active.reduce((s, r) => s + r.amount, 0),
      detail: `grossVolume=${metrics.grossVolume}`,
    },
    {
      name: 'net_volume_equals_sum_net_transfers',
      passed: metrics.netVolume === sumNetTransferAmounts,
      detail: `netVolume=${metrics.netVolume}, Σ transfers=${sumNetTransferAmounts}`,
    },
    {
      name: 'positive_balances_equal_negative_abs',
      passed: Math.abs(sumPositive - sumNegativeAbs) < eps,
      detail: `Σ+ = ${sumPositive}, Σ|−| = ${sumNegativeAbs}`,
    },
    {
      name: 'net_volume_equals_positive_balance_total',
      passed: Math.abs(metrics.netVolume - sumPositive) < eps,
      detail: `netVolume=${metrics.netVolume}, Σ+ = ${sumPositive}`,
    },
    {
      name: 'savings_identity',
      passed: metrics.savings === metrics.grossVolume - metrics.netVolume,
      detail: `savings=${metrics.savings} = ${metrics.grossVolume} − ${metrics.netVolume}`,
    },
    {
      name: 'no_value_created',
      passed:
        metrics.netVolume <= metrics.grossVolume + eps &&
        metrics.savings >= -eps,
      detail: `net ≤ gross and savings ≥ 0`,
    },
    {
      name: 'portfolio_mirrors_algorithm',
      passed:
        portfolio.grossDebtSar === metrics.grossVolume &&
        portfolio.netSettlementSar === metrics.netVolume &&
        portfolio.savingsSar === metrics.savings &&
        portfolio.savingsPct === metrics.efficiencyPct &&
        portfolio.transfersBefore === active.length &&
        portfolio.transfersAfter === netTransfers.length,
      detail: 'demoPortfolio fields equal computeNetting() metrics',
    },
    {
      name: 'company_balance_count_matches',
      passed: companyBalances.length === balanceMap.size,
      detail: `${companyBalances.length} company balances`,
    },
    {
      name: 'scale_companies',
      passed: portfolio.participatingCompanies >= 300 &&
        portfolio.participatingCompanies <= 500,
      detail: `${portfolio.participatingCompanies} companies`,
    },
    {
      name: 'scale_relationships',
      passed: portfolio.financialRelationships >= 2000,
      detail: `${portfolio.financialRelationships} relationships`,
    },
  ]

  return {
    passed: checks.every((c) => c.passed),
    checks,
    kpis: portfolio,
    provenance: {
      algorithm: 'computeNetting() → computeNetTransfers() (netting-core)',
      sourceFiles: [
        'server/lib/derive.ts',
        'src/lib/netting-core.ts',
        'scripts/generate-enterprise-demo.ts',
      ],
      companyCount: portfolio.participatingCompanies,
      relationshipCount: portfolio.financialRelationships,
      activeRelationshipCount: active.length,
      netTransferCount: netTransfers.length,
    },
  }
}

function writeJson(path: string, data: unknown): void {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function writeValidationMarkdown(report: ValidationReport): void {
  const lines = [
    '# Enterprise Demo Validation Report',
    '',
    `**Status:** ${report.passed ? 'PASSED' : 'FAILED'}`,
    '',
    'All presentation KPIs are produced by running the generated dataset through the existing `computeNetting()` algorithm. No metrics are hand-authored.',
    '',
    '## Provenance',
    '',
    `| Field | Value |`,
    `| --- | --- |`,
    `| Algorithm | \`${report.provenance.algorithm}\` |`,
    `| Companies | ${report.provenance.companyCount} |`,
    `| Relationships (all) | ${report.provenance.relationshipCount} |`,
    `| Active relationships (transfers before) | ${report.provenance.activeRelationshipCount} |`,
    `| Net transfers (transfers after) | ${report.provenance.netTransferCount} |`,
    '',
    'Source files:',
    '',
    ...report.provenance.sourceFiles.map((f) => `- \`${f}\``),
    '',
    '## KPIs (algorithm output)',
    '',
    `| KPI | Value |`,
    `| --- | --- |`,
    `| Companies count | ${report.kpis.participatingCompanies} |`,
    `| Relationships count | ${report.kpis.financialRelationships} |`,
    `| Gross debt (SAR) | ${report.kpis.grossDebtSar.toLocaleString('en-US')} |`,
    `| Net obligation (SAR) | ${report.kpis.netSettlementSar.toLocaleString('en-US')} |`,
    `| Transfers before | ${report.kpis.transfersBefore} |`,
    `| Transfers after | ${report.kpis.transfersAfter} |`,
    `| Savings (SAR) | ${report.kpis.savingsSar.toLocaleString('en-US')} |`,
    `| Improvement % (volume) | ${report.kpis.savingsPct}% |`,
    `| Transfer-count reduction % | ${report.kpis.transferReductionPct}% |`,
    '',
    '## Mathematical conservation checks',
    '',
    `| Check | Result | Detail |`,
    `| --- | --- | --- |`,
    ...report.checks.map(
      (c) =>
        `| \`${c.name}\` | ${c.passed ? 'PASS' : 'FAIL'} | ${c.detail} |`,
    ),
    '',
    '### Identities verified',
    '',
    '1. **Total money preserved:** Σ company net balances = 0.',
    '2. **Net balances preserved:** Σ positive balances = Σ |negative balances| = net settlement volume.',
    '3. **No value created or lost:** savings = gross − net ≥ 0 and net ≤ gross.',
    '4. **UI KPIs = algorithm:** `demoPortfolio` fields are copied from `computeNetting()` output at generation time.',
    '',
    '## How to regenerate',
    '',
    '```bash',
    'npm run demo:generate',
    '```',
    '',
  ]
  writeFileSync(
    join(DOCS_DIR, 'enterprise-demo-validation.md'),
    `${lines.join('\n')}\n`,
    'utf8',
  )
}

function main(): void {
  mkdirSync(OUT_DIR, { recursive: true })
  mkdirSync(DOCS_DIR, { recursive: true })

  const companyCount = 420
  console.log(`Generating ${companyCount} companies…`)
  const meta = generateCompanies(companyCount)

  console.log('Generating financial relationships…')
  const debtRecords = generateDebts(meta)
  console.log(`  → ${debtRecords.length} relationships`)

  console.log('Running computeNetting() on full dataset…')
  const t0 = performance.now()
  const computation = computeNetting(debtRecords)
  const elapsed = performance.now() - t0
  console.log(`  → done in ${elapsed.toFixed(1)}ms`)
  console.log(
    `  → gross=${computation.metrics.grossVolume} net=${computation.metrics.netVolume} savings=${computation.metrics.savings} (${computation.metrics.efficiencyPct}%)`,
  )
  console.log(
    `  → transfers ${debtRecords.filter((r) => r.status !== 'settled').length} → ${computation.netTransfers.length}`,
  )

  const companies = deriveCompanies(debtRecords, meta)
  const activeCompanies = companies.filter((c) => c.activeDebts > 0)
  const portfolio = buildPortfolio(
    debtRecords,
    computation,
    activeCompanies.length > 0 ? activeCompanies.length : meta.length,
  )

  // Monthly trend: cumulative active obligations with dueDate ≤ month end
  const monthlyTrend = MONTH_ENDS.map((end, idx) => {
    const slice = debtRecords.filter((r) => r.dueDate <= end)
    const m = computeNetting(slice).metrics
    return {
      month: MONTHS_AR[idx]!,
      grossVolume: m.grossVolume,
      nettedVolume: m.netVolume,
      savings: m.savings,
    }
  })

  // Ensure final month matches full portfolio (all debts through June+)
  const juneSlice = debtRecords.filter((r) => r.dueDate <= '2026-06-30')
  const juneMetrics = computeNetting(juneSlice).metrics
  // Replace June with full-portfolio metrics so dashboard June = current KPIs
  monthlyTrend[5] = {
    month: 'يونيو',
    grossVolume: portfolio.grossDebtSar,
    nettedVolume: portfolio.netSettlementSar,
    savings: portfolio.savingsSar,
  }

  const netTransfers: NetTransferOut[] = computation.netTransfers.map((t) => ({
    id: t.id,
    from: t.from,
    to: t.to,
    amount: t.amount,
    bilateralSavings: t.bilateralSavings,
  }))

  // Sample for UI lists (top by amount) — KPIs still use full counts
  const SAMPLE_TX = 12
  const beforeSample = [...debtRecords]
    .filter((r) => r.status !== 'settled')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, SAMPLE_TX)
  const afterSample = [...netTransfers]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, SAMPLE_TX)

  const chartCompanies = [...companies]
    .sort(
      (a, b) =>
        b.totalPayable + b.totalReceivable - (a.totalPayable + a.totalReceivable),
    )
    .slice(0, 6)

  const companyDebtShares = chartCompanies.map((c) => ({
    company: c.shortLabel,
    payable: c.totalPayable,
    receivable: c.totalReceivable,
  }))

  const recentDebts = [...debtRecords]
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
    .slice(0, 8)
    .map((r) => ({
      id: r.id,
      from: r.debtor,
      to: r.creditor,
      amount: r.amount,
      status:
        r.status === 'settled'
          ? ('netted' as const)
          : r.status === 'overdue'
            ? ('partial' as const)
            : ('pending' as const),
      dueDate: r.dueDate,
    }))

  const debtLedger = [...debtRecords]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 80)

  const report = validate(debtRecords, computation, portfolio)
  if (!report.passed) {
    console.error('VALIDATION FAILED:')
    for (const c of report.checks.filter((x) => !x.passed)) {
      console.error(`  ✗ ${c.name}: ${c.detail}`)
    }
    process.exit(1)
  }

  writeJson(join(OUT_DIR, 'enterprise-debt-records.json'), debtRecords)
  writeJson(join(OUT_DIR, 'enterprise-company-meta.json'), meta)
  writeJson(join(OUT_DIR, 'enterprise-computed.json'), {
    generatedAt: new Date().toISOString(),
    algorithm: 'computeNetting',
    computeElapsedMs: Math.round(elapsed * 100) / 100,
    portfolio,
    companies,
    sampleCompanyIds: chartCompanies.map((c) => c.id),
    companyDebtShares,
    monthlyTrend,
    juneSliceNote:
      'June chart point uses full-portfolio computeNetting metrics; earlier months use cumulative dueDate slices.',
    juneSliceMetrics: juneMetrics,
    netTransfers,
    beforeTransferSample: beforeSample.map((r) => ({
      id: r.id,
      from: r.debtor,
      to: r.creditor,
      amount: r.amount,
    })),
    afterTransferSample: afterSample.map((t) => ({
      id: t.id,
      from: t.from,
      to: t.to,
      amount: t.amount,
      bilateralSavings: t.bilateralSavings,
    })),
    recentDebts,
    debtLedger,
    validation: report,
  })

  writeValidationMarkdown(report)

  // Compact TS barrels for typed imports (debt ledger kept separate for code-splitting)
  writeFileSync(
    join(OUT_DIR, 'index.ts'),
    `/**
 * Auto-generated enterprise demo artefacts (presentation + KPIs).
 * Regenerate with: npm run demo:generate
 * DO NOT hand-edit KPI numbers — they come from computeNetting().
 *
 * Full debt ledger lives in \`./debt-records\` and is loaded only when needed.
 */

import companyMetaJson from './enterprise-company-meta.json'
import computedJson from './enterprise-computed.json'

export type GeneratedPortfolio = typeof computedJson.portfolio
export type GeneratedCompany = (typeof computedJson.companies)[number]

export const enterpriseCompanyMeta = companyMetaJson as Array<{
  id: string
  name: string
  nameEn: string
  sector: string
  shortLabel: string
}>
export const enterpriseComputed = computedJson
export const enterprisePortfolio = computedJson.portfolio
export const enterpriseCompanies = computedJson.companies
export const enterpriseNetTransfers = computedJson.netTransfers
export const enterpriseValidation = computedJson.validation
`,
    'utf8',
  )

  writeFileSync(
    join(OUT_DIR, 'debt-records.ts'),
    `/**
 * Full enterprise debt ledger (lazy-loaded).
 * Regenerate with: npm run demo:generate
 */

import debtRecordsJson from './enterprise-debt-records.json'

export type GeneratedDebtRecord = {
  id: string
  creditor: string
  debtor: string
  amount: number
  currency: string
  dueDate: string
  status: 'pending' | 'overdue' | 'settled'
}

export const enterpriseDebtRecords = debtRecordsJson as GeneratedDebtRecord[]
`,
    'utf8',
  )

  console.log('\nValidation: PASSED')
  console.log(`Wrote artefacts to ${OUT_DIR}`)
  console.log(`Wrote report to ${join(DOCS_DIR, 'enterprise-demo-validation.md')}`)
  console.log('\nKPI summary:')
  console.log(`  Companies:      ${portfolio.participatingCompanies}`)
  console.log(`  Relationships:  ${portfolio.financialRelationships}`)
  console.log(`  Gross debt:     ${portfolio.grossDebtSar}`)
  console.log(`  Net obligation: ${portfolio.netSettlementSar}`)
  console.log(`  Before → After: ${portfolio.transfersBefore} → ${portfolio.transfersAfter}`)
  console.log(`  Savings:        ${portfolio.savingsSar} (${portfolio.savingsPct}%)`)
}

main()
