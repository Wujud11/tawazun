import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

import type { Company } from '@/types/dashboard'

import {
  formatDateTime,
  formatNumber,
  formatPercent,
  formatSar,
} from './format'

type NettingOpportunity = {
  companies: string[]
  netAmount: number
  direction: string
  savings: number
  recommendation: string
}

type RiskFlag = {
  companyName: string
  risk: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

export type NettingPdfInput = {
  analysis: {
    summary: string
    metrics: {
      totalGrossVolume: number
      totalNetVolume: number
      estimatedSavings: number
      efficiencyPct: number
      recommendedTransactions: number
      overdueCount: number
      overdueVolume: number
    }
    nettingOpportunities: NettingOpportunity[]
    riskFlags: RiskFlag[]
    insights: string[]
  }
  companies: Company[]
  countBefore: number
  grossVolume: number
}

const SEVERITY_LABEL: Record<RiskFlag['severity'], string> = {
  high: 'عالي',
  medium: 'متوسط',
  low: 'منخفض',
}

const SEVERITY_STYLE: Record<RiskFlag['severity'], string> = {
  high: 'background:#fef2f2;border-color:#fecaca;color:#991b1b;',
  medium: 'background:#fffbeb;border-color:#fde68a;color:#92400e;',
  low: 'background:#f9fafb;border-color:#e5e7eb;color:#374151;',
}

function buildReportHtml(data: NettingPdfInput): string {
  const { analysis, companies, countBefore, grossVolume } = data
  const { metrics, nettingOpportunities, riskFlags, insights } = analysis
  const countAfter = metrics.recommendedTransactions
  const countReduction =
    countBefore > 0
      ? Math.round((1 - countAfter / countBefore) * 100)
      : 0

  const companyRows = companies
    .map(
      (c, i) => `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding:9px 10px;border-bottom:1px solid #e5e7eb;">${c.name}</td>
        <td style="padding:9px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:#4b5563;">${c.sector}</td>
        <td style="padding:9px 10px;border-bottom:1px solid #e5e7eb;text-align:left;font-family:ui-monospace,monospace;">${formatSar(c.totalPayable)}</td>
        <td style="padding:9px 10px;border-bottom:1px solid #e5e7eb;text-align:left;font-family:ui-monospace,monospace;">${formatSar(c.totalReceivable)}</td>
      </tr>`,
    )
    .join('')

  const riskRows =
    riskFlags.length > 0
      ? riskFlags
          .map(
            (f) => `
        <div style="margin-bottom:10px;padding:12px 14px;border:1px solid;border-radius:10px;${SEVERITY_STYLE[f.severity]}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <strong style="font-size:13px;">${f.companyName}</strong>
            <span style="font-size:11px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,0.7);font-weight:600;">${SEVERITY_LABEL[f.severity]}</span>
          </div>
          <p style="margin:0;font-size:12px;line-height:1.7;opacity:0.9;">${f.description}</p>
        </div>`,
          )
          .join('')
      : '<p style="color:#6b7280;font-size:12px;">لا توجد مؤشرات مخاطر حالياً.</p>'

  const recommendationRows = nettingOpportunities
    .map(
      (op, i) => `
      <div style="margin-bottom:10px;padding:12px 14px;border:1px solid #a7f3d0;border-radius:10px;background:linear-gradient(180deg,#ecfdf5 0%,#f0fdf4 100%);">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;gap:12px;">
          <strong style="font-size:13px;">${i + 1}. ${op.direction}</strong>
          <span style="font-family:ui-monospace,monospace;font-size:12px;font-weight:700;color:#047857;white-space:nowrap;">${formatSar(op.netAmount)}</span>
        </div>
        <p style="margin:0 0 4px;font-size:11px;color:#059669;">توفير ثنائي: ${formatSar(op.savings)}</p>
        <p style="margin:0;font-size:12px;color:#374151;line-height:1.6;">${op.recommendation}</p>
      </div>`,
    )
    .join('')

  const insightRows = insights
    .map(
      (insight, i) => `
      <div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start;padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;">
        <span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:#1e3a5f;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">${i + 1}</span>
        <p style="margin:0;font-size:12px;line-height:1.7;color:#374151;">${insight}</p>
      </div>`,
    )
    .join('')

  return `
    <div dir="rtl" style="width:794px;padding:36px 40px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#111827;background:#fff;line-height:1.5;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1e3a5f;padding-bottom:18px;margin-bottom:22px;">
        <div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
            <div style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#1e3a5f,#2563eb);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(30,58,95,0.25);">
              <span style="color:#fff;font-size:18px;font-weight:700;">ت</span>
            </div>
            <div>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#1e3a5f;">توازن</h1>
              <p style="margin:0;font-size:11px;color:#6b7280;letter-spacing:0.06em;">TAWAZUN TREASURY — MULTILATERAL NETTING</p>
            </div>
          </div>
          <p style="margin:10px 0 0;font-size:15px;font-weight:700;color:#111827;">التقرير التنفيذي لتحليل المقاصة</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">دورة تسوية متعددة الأطراف — عرض للمستثمرين والإدارة المالية</p>
        </div>
        <div style="text-align:left;font-size:11px;color:#6b7280;padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#f8fafc;min-width:150px;">
          <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;">تاريخ الإصدار</p>
          <p style="margin:4px 0 0;font-weight:700;color:#111827;font-size:12px;">${formatDateTime()}</p>
          <p style="margin:8px 0 0;font-size:10px;">الحالة</p>
          <p style="margin:2px 0 0;font-weight:600;color:#047857;">جاهز للمراجعة</p>
        </div>
      </div>

      <h2 style="font-size:13px;font-weight:700;color:#1e3a5f;margin:0 0 12px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;letter-spacing:0.02em;">مؤشرات المقاصة</h2>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">
        <div style="padding:14px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;text-align:center;">
          <p style="margin:0;font-size:10px;color:#6b7280;">قبل المقاصة</p>
          <p style="margin:6px 0 2px;font-size:22px;font-weight:700;color:#dc2626;">${formatNumber(countBefore)}</p>
          <p style="margin:0;font-size:10px;color:#9ca3af;">تحويل</p>
        </div>
        <div style="padding:14px;border:1px solid #a7f3d0;border-radius:10px;background:#ecfdf5;text-align:center;">
          <p style="margin:0;font-size:10px;color:#047857;">بعد المقاصة</p>
          <p style="margin:6px 0 2px;font-size:22px;font-weight:700;color:#047857;">${formatNumber(countAfter)}</p>
          <p style="margin:0;font-size:10px;color:#9ca3af;">تحويل</p>
        </div>
        <div style="padding:14px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;text-align:center;">
          <p style="margin:0;font-size:10px;color:#6b7280;">تخفيض التحويلات</p>
          <p style="margin:6px 0 2px;font-size:22px;font-weight:700;color:#1e3a5f;">${formatPercent(countReduction)}</p>
        </div>
        <div style="padding:14px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;text-align:center;">
          <p style="margin:0;font-size:10px;color:#6b7280;">كفاءة المقاصة</p>
          <p style="margin:6px 0 2px;font-size:22px;font-weight:700;color:#2563eb;">${formatPercent(metrics.efficiencyPct)}</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px;">
        <div style="padding:14px 16px;border-radius:10px;background:#1e3a5f;color:#fff;">
          <p style="margin:0;font-size:10px;opacity:0.8;">الحجم الإجمالي</p>
          <p style="margin:6px 0 0;font-size:16px;font-weight:700;font-family:ui-monospace,monospace;">${formatSar(grossVolume)}</p>
        </div>
        <div style="padding:14px 16px;border-radius:10px;background:#2563eb;color:#fff;">
          <p style="margin:0;font-size:10px;opacity:0.8;">الحجم الصافي</p>
          <p style="margin:6px 0 0;font-size:16px;font-weight:700;font-family:ui-monospace,monospace;">${formatSar(metrics.totalNetVolume)}</p>
        </div>
        <div style="padding:14px 16px;border-radius:10px;background:#047857;color:#fff;">
          <p style="margin:0;font-size:10px;opacity:0.8;">التوفير المقدّر</p>
          <p style="margin:6px 0 0;font-size:16px;font-weight:700;font-family:ui-monospace,monospace;">${formatSar(metrics.estimatedSavings)}</p>
        </div>
      </div>

      <h2 style="font-size:13px;font-weight:700;color:#1e3a5f;margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">الملخص التنفيذي</h2>
      <div style="padding:16px;border:1px solid #dbeafe;border-radius:10px;background:linear-gradient(180deg,#f8fafc 0%,#eff6ff 100%);margin-bottom:24px;">
        <p style="margin:0;font-size:13px;line-height:1.9;color:#1f2937;">${analysis.summary}</p>
      </div>

      <h2 style="font-size:13px;font-weight:700;color:#1e3a5f;margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">الشركات في الشبكة</h2>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:24px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#1e3a5f;color:#fff;">
            <th style="padding:10px;text-align:right;font-weight:600;">الشركة</th>
            <th style="padding:10px;text-align:center;font-weight:600;">القطاع</th>
            <th style="padding:10px;text-align:left;font-weight:600;">مستحق الدفع</th>
            <th style="padding:10px;text-align:left;font-weight:600;">مستحق القبض</th>
          </tr>
        </thead>
        <tbody>${companyRows}</tbody>
      </table>

      <h2 style="font-size:13px;font-weight:700;color:#1e3a5f;margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">مؤشرات المخاطر</h2>
      <div style="margin-bottom:24px;">${riskRows}</div>

      <h2 style="font-size:13px;font-weight:700;color:#1e3a5f;margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">التوصيات</h2>
      <div style="margin-bottom:24px;">${recommendationRows}</div>

      <h2 style="font-size:13px;font-weight:700;color:#1e3a5f;margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">رؤى مالية</h2>
      <div style="margin-bottom:16px;">${insightRows}</div>

      <div style="margin-top:28px;padding:14px 16px;border-top:1px solid #e5e7eb;background:#f8fafc;border-radius:10px;text-align:center;font-size:10px;color:#6b7280;">
        <p style="margin:0;font-weight:600;color:#1e3a5f;">تقرير صادر عن منصة توازن — تحليل مقاصة متعددة الأطراف</p>
        <p style="margin:4px 0 0;">الأرقام محسوبة خوارزمياً — التحليل النوعي مدعوم بـ GPT-4o — للاستخدام التجريبي والعرض التقديمي</p>
      </div>
    </div>
  `
}

export async function exportNettingPdf(data: NettingPdfInput): Promise<void> {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.innerHTML = buildReportHtml(data)
  document.body.appendChild(container)

  const reportEl = container.firstElementChild as HTMLElement

  try {
    const canvas = await html2canvas(reportEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const contentWidth = pageWidth - margin * 2

    const imgWidth = contentWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = margin

    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight)
    heightLeft -= pageHeight - margin * 2

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight)
      heightLeft -= pageHeight - margin * 2
    }

    const timestamp = new Date().toISOString().slice(0, 10)
    pdf.save(`tawazun-netting-report-${timestamp}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
