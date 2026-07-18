import type { Activity } from '@/types/dashboard'

import { debtRecords } from '@/data/debts-mock'
import { deriveCompanies, deriveRecentDebts } from '@/lib/derive'
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

// ─── Derived exports ───────────────────────────────────────────────────────────

export const companies = deriveCompanies(debtRecords, companyMeta)
export const debts = deriveRecentDebts(debtRecords, 5)

// ─── Static / cosmetic data ────────────────────────────────────────────────────
// Historical trend and activity log are not derivable from debtRecords;
// kept as static demo content for the hackathon presentation.

export const recentActivity: Activity[] = [
  {
    id: 'a1',
    type: 'netting',
    title: 'اكتملت دورة مقاصة مؤسسية',
    description:
      'بيانات تجريبية: إغلاق دفعة تحويلات عبر شبكة واسعة من الأطراف',
    timestamp: '2026-06-29T09:42:00',
    amount: 17_660_000,
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
    amount: 2_450_000,
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
    description: 'تحسن كفاءة المقاصة 8% مقارنة بالأسبوع السابق (تجريبي)',
    timestamp: '2026-06-27T09:00:00',
  },
]
