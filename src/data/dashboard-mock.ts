import type { Activity, ChartDataPoint } from '@/types/dashboard'

import { debtRecords } from '@/data/debts-mock'
import {
  deriveCompanies,
  deriveCompanyDebtShares,
  deriveDashboardKpis,
  deriveNetting,
  deriveRecentDebts,
  deriveTransferComparison,
} from '@/lib/derive'
import type { CompanyMeta } from '@/lib/derive'

// ─── Non-derivable company metadata ───────────────────────────────────────────
// Financial fields (receivables, payables, net balance, activeDebts) are derived
// from debtRecords. Only the identity fields that cannot be computed are stored here.

const companyMeta: CompanyMeta[] = [
  { id: 'c1', name: 'شركة ألف للتجارة', nameEn: 'Alif Trading Co.', sector: 'تجارة' },
  { id: 'c2', name: 'شركة باء القابضة', nameEn: 'Ba Holding', sector: 'استثمار' },
  { id: 'c3', name: 'شركة جيم للمقاولات', nameEn: 'Jim Contracting', sector: 'مقاولات' },
  { id: 'c4', name: 'شركة دال للخدمات', nameEn: 'Dal Services', sector: 'خدمات' },
  { id: 'c5', name: 'شركة هـ للتمويل', nameEn: 'Ha Finance', sector: 'تمويل' },
  { id: 'c6', name: 'شركة واو للتوريد', nameEn: 'Waw Supply', sector: 'توريد' },
  { id: 'c7', name: 'شركة زين للتطوير', nameEn: 'Zain Development', sector: 'تطوير' },
  { id: 'c8', name: 'شركة حاء للاستشارات', nameEn: 'Haa Consulting', sector: 'استشارات' },
]

// ─── Single netting pass shared between consumers ──────────────────────────────
const nettingResult = deriveNetting(debtRecords)

// ─── Derived exports ───────────────────────────────────────────────────────────

export const companies = deriveCompanies(debtRecords, companyMeta)
export const companyDebtShares = deriveCompanyDebtShares(debtRecords, companyMeta)
export const transferComparison = deriveTransferComparison(nettingResult)
export const dashboardKpis = deriveDashboardKpis(debtRecords, nettingResult)
export const debts = deriveRecentDebts(debtRecords, 5)

// ─── Static / cosmetic data ────────────────────────────────────────────────────
// Historical trend and activity log are not derivable from debtRecords;
// kept as static demo content for the hackathon presentation.

export const recentActivity: Activity[] = [
  {
    id: 'a1',
    type: 'netting',
    title: 'اكتملت مقاصة ذكية',
    description: 'تم تسوية 3 ديون متقاطعة بين ألف، باء، وجيم',
    timestamp: '2026-06-29T09:42:00',
    amount: 480_000,
  },
  {
    id: 'a2',
    type: 'analysis',
    title: 'تحليل AI للشبكة',
    description: 'اكتشاف 5 فرص مقاصة إضافية بقيمة 1.2M ر.س',
    timestamp: '2026-06-29T08:15:00',
  },
  {
    id: 'a3',
    type: 'transfer',
    title: 'تحويل مجدول',
    description: 'تحويل من دال إلى باء — بانتظار الموافقة',
    timestamp: '2026-06-28T16:30:00',
    amount: 320_000,
  },
  {
    id: 'a4',
    type: 'settlement',
    title: 'تسوية مكتملة',
    description: 'تم إغلاق دين بين هـ وواو بنجاح',
    timestamp: '2026-06-28T11:05:00',
    amount: 230_000,
  },
  {
    id: 'a5',
    type: 'netting',
    title: 'مقاصة جزئية',
    description: 'تخفيض دين باء → جيم بنسبة 35%',
    timestamp: '2026-06-27T14:20:00',
    amount: 217_000,
  },
  {
    id: 'a6',
    type: 'analysis',
    title: 'تقرير أسبوعي',
    description: 'تحسن كفاءة المقاصة 15% مقارنة بالأسبوع السابق',
    timestamp: '2026-06-27T09:00:00',
  },
]

export const monthlyTrend: ChartDataPoint[] = [
  { month: 'يناير', grossVolume: 3_200_000, nettedVolume: 2_100_000, savings: 1_100_000 },
  { month: 'فبراير', grossVolume: 2_800_000, nettedVolume: 1_900_000, savings: 900_000 },
  { month: 'مارس', grossVolume: 3_500_000, nettedVolume: 2_400_000, savings: 1_100_000 },
  { month: 'أبريل', grossVolume: 2_900_000, nettedVolume: 2_000_000, savings: 900_000 },
  { month: 'مايو', grossVolume: 3_100_000, nettedVolume: 2_200_000, savings: 900_000 },
  { month: 'يونيو', grossVolume: 4_743_000, nettedVolume: 1_820_000, savings: 2_923_000 },
]
