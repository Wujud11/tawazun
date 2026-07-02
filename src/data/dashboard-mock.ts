import type {
  Activity,
  ChartDataPoint,
  Company,
  CompanyDebtShare,
  Debt,
  KpiMetric,
  TransferComparison,
} from '@/types/dashboard'

export const dashboardKpis: KpiMetric[] = [
  {
    id: 'total-debts',
    label: 'إجمالي الديون',
    value: '2,500,000',
    change: 12.4,
    changeLabel: 'مقارنة بالشهر الماضي',
  },
  {
    id: 'active-companies',
    label: 'الشركات النشطة',
    value: '24',
    change: 8.3,
    changeLabel: 'شركة جديدة هذا الربع',
  },
  {
    id: 'netting-efficiency',
    label: 'كفاءة المقاصة',
    value: '68%',
    change: 15.2,
    changeLabel: 'تحسن بعد المقاصة الذكية',
  },
  {
    id: 'saved-transfers',
    label: 'تحويلات تم توفيرها',
    value: '14',
    change: 26,
    changeLabel: 'تقليل عدد التحويلات',
  },
]

export const debts: Debt[] = [
  {
    id: 'd1',
    from: 'شركة ألف للتجارة',
    to: 'شركة باء القابضة',
    amount: 850_000,
    status: 'pending',
    dueDate: '2026-07-15',
  },
  {
    id: 'd2',
    from: 'شركة باء القابضة',
    to: 'شركة جيم للمقاولات',
    amount: 620_000,
    status: 'partial',
    dueDate: '2026-07-20',
  },
  {
    id: 'd3',
    from: 'شركة جيم للمقاولات',
    to: 'شركة ألف للتجارة',
    amount: 480_000,
    status: 'netted',
    dueDate: '2026-07-10',
  },
  {
    id: 'd4',
    from: 'شركة دال للخدمات',
    to: 'شركة باء القابضة',
    amount: 320_000,
    status: 'pending',
    dueDate: '2026-07-25',
  },
  {
    id: 'd5',
    from: 'شركة هـ للتمويل',
    to: 'شركة واو للتوريد',
    amount: 230_000,
    status: 'netted',
    dueDate: '2026-07-08',
  },
]

export const companies: Company[] = [
  {
    id: 'c1',
    name: 'شركة ألف للتجارة',
    nameEn: 'Alif Trading Co.',
    sector: 'تجارة',
    netBalance: -370_000,
    totalPayable: 850_000,
    totalReceivable: 480_000,
    activeDebts: 2,
  },
  {
    id: 'c2',
    name: 'شركة باء القابضة',
    nameEn: 'Ba Holding',
    sector: 'استثمار',
    netBalance: -450_000,
    totalPayable: 620_000,
    totalReceivable: 170_000,
    activeDebts: 3,
  },
  {
    id: 'c3',
    name: 'شركة جيم للمقاولات',
    nameEn: 'Jim Contracting',
    sector: 'مقاولات',
    netBalance: 140_000,
    totalPayable: 480_000,
    totalReceivable: 620_000,
    activeDebts: 2,
  },
  {
    id: 'c4',
    name: 'شركة دال للخدمات',
    nameEn: 'Dal Services',
    sector: 'خدمات',
    netBalance: -320_000,
    totalPayable: 320_000,
    totalReceivable: 0,
    activeDebts: 1,
  },
  {
    id: 'c5',
    name: 'شركة هـ للتمويل',
    nameEn: 'Ha Finance',
    sector: 'تمويل',
    netBalance: 230_000,
    totalPayable: 0,
    totalReceivable: 230_000,
    activeDebts: 1,
  },
  {
    id: 'c6',
    name: 'شركة واو للتوريد',
    nameEn: 'Waw Supply',
    sector: 'توريد',
    netBalance: -230_000,
    totalPayable: 230_000,
    totalReceivable: 0,
    activeDebts: 1,
  },
]

export const transferComparison: TransferComparison = {
  label: 'مقارنة التحويلات',
  beforeCount: 18,
  afterCount: 4,
  beforeVolume: 2_500_000,
  afterVolume: 800_000,
}

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
  { month: 'يونيو', grossVolume: 2_500_000, nettedVolume: 1_700_000, savings: 800_000 },
]

export const companyDebtShares: CompanyDebtShare[] = [
  { company: 'ألف', payable: 850_000, receivable: 480_000 },
  { company: 'باء', payable: 620_000, receivable: 170_000 },
  { company: 'جيم', payable: 480_000, receivable: 620_000 },
  { company: 'دال', payable: 320_000, receivable: 0 },
  { company: 'هـ', payable: 0, receivable: 230_000 },
  { company: 'واو', payable: 230_000, receivable: 0 },
]

export function formatSar(amount: number): string {
  return `${amount.toLocaleString('ar-SA')} ر.س`
}

export function formatCompactSar(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M ر.س`
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K ر.س`
  }
  return formatSar(amount)
}
