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
      (c) => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${c.name}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">${c.sector}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:left;font-family:monospace;">${formatSar(c.totalPayable)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:left;font-family:monospace;">${formatSar(c.totalReceivable)}</td>
      </tr>`,
    )
    .join('')

  const riskRows =
    riskFlags.length > 0
      ? riskFlags
          .map(
            (f) => `
        <div style="margin-bottom:10px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <strong style="font-size:13px;">${f.companyName}</strong>
            <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:#fee2e2;color:#991b1b;">${SEVERITY_LABEL[f.severity]}</span>
          </div>
          <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.6;">${f.description}</p>
        </div>`,
          )
          .join('')
      : '<p style="color:#6b7280;font-size:12px;">لا توجد مؤشرات مخاطر حالياً.</p>'

  const recommendationRows = nettingOpportunities
    .map(
      (op, i) => `
      <div style="margin-bottom:10px;padding:12px;border:1px solid #d1fae5;border-radius:8px;background:#ecfdf5;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <strong style="font-size:13px;">${i + 1}. ${op.direction}</strong>
          <span style="font-family:monospace;font-size:12px;font-weight:600;color:#047857;">${formatSar(op.netAmount)}</span>
        </div>
        <p style="margin:0 0 4px;font-size:11px;color:#6b7280;">توفير ثنائي: ${formatSar(op.savings)}</p>
        <p style="margin:0;font-size:12px;color:#374151;">${op.recommendation}</p>
      </div>`,
    )
    .join('')

  const insightRows = insights
    .map(
      (insight, i) => `
      <div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start;">
        <span style="flex-shrink:0;width:22px;height:22px;border-radius:50%;background:#eff6ff;color:#1d4ed8;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">${i + 1}</span>
        <p style="margin:0;font-size:12px;line-height:1.6;color:#374151;">${insight}</p>
      </div>`,
    )
    .join('')

  return `
    <div dir="rtl" style="width:794px;padding:40px;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#111827;background:#fff;line-height:1.5;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1e3a5f;padding-bottom:20px;margin-bottom:24px;">
        <div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
            <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#1e3a5f,#2563eb);display:flex;align-items:center;justify-content:center;">
              <span style="color:#fff;font-size:18px;font-weight:700;">ت</span>
            </div>
            <div>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#1e3a5f;">توازن</h1>
              <p style="margin:0;font-size:11px;color:#6b7280;letter-spacing:0.05em;">TAWAZUN — منصة المقاصة الذكية</p>
            </div>
          </div>
          <p style="margin:8px 0 0;font-size:13px;color:#4b5563;">تقرير تحليل المقاصة المالية</p>
        </div>
        <div style="text-align:left;font-size:11px;color:#6b7280;">
          <p style="margin:0;">تاريخ الإصدار</p>
          <p style="margin:4px 0 0;font-weight:600;color:#111827;">${formatDateTime()}</p>
        </div>
      </div>

      <h2 style="font-size:14px;font-weight:700;color:#1e3a5f;margin:0 0 12px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">مؤشرات المقاصة</h2>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px;">
        <div style="padding:14px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;text-align:center;">
          <p style="margin:0;font-size:10px;color:#6b7280;">قبل المقاصة</p>
          <p style="margin:6px 0 2px;font-size:20px;font-weight:700;color:#dc2626;">${formatNumber(countBefore)}</p>
          <p style="margin:0;font-size:10px;color:#9ca3af;">تحويل</p>
        </div>
        <div style="padding:14px;border:1px solid #d1fae5;border-radius:8px;background:#ecfdf5;text-align:center;">
          <p style="margin:0;font-size:10px;color:#047857;">بعد المقاصة</p>
          <p style="margin:6px 0 2px;font-size:20px;font-weight:700;color:#047857;">${formatNumber(countAfter)}</p>
          <p style="margin:0;font-size:10px;color:#9ca3af;">تحويل</p>
        </div>
        <div style="padding:14px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;text-align:center;">
          <p style="margin:0;font-size:10px;color:#6b7280;">تخفيض التحويلات</p>
          <p style="margin:6px 0 2px;font-size:20px;font-weight:700;color:#1e3a5f;">${formatPercent(countReduction)}</p>
        </div>
        <div style="padding:14px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;text-align:center;">
          <p style="margin:0;font-size:10px;color:#6b7280;">كفاءة المقاصة</p>
          <p style="margin:6px 0 2px;font-size:20px;font-weight:700;color:#2563eb;">${formatPercent(metrics.efficiencyPct)}</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px;">
        <div style="padding:12px 14px;border-radius:8px;background:#1e3a5f;color:#fff;">
          <p style="margin:0;font-size:10px;opacity:0.8;">الحجم الإجمالي</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:700;font-family:monospace;">${formatSar(grossVolume)}</p>
        </div>
        <div style="padding:12px 14px;border-radius:8px;background:#2563eb;color:#fff;">
          <p style="margin:0;font-size:10px;opacity:0.8;">الحجم الصافي</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:700;font-family:monospace;">${formatSar(metrics.totalNetVolume)}</p>
        </div>
        <div style="padding:12px 14px;border-radius:8px;background:#047857;color:#fff;">
          <p style="margin:0;font-size:10px;opacity:0.8;">التوفير المقدّر</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:700;font-family:monospace;">${formatSar(metrics.estimatedSavings)}</p>
        </div>
      </div>

      <h2 style="font-size:14px;font-weight:700;color:#1e3a5f;margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">الملخص التنفيذي</h2>
      <div style="padding:14px;border:1px solid #e5e7eb;border-radius:8px;background:#f8fafc;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;line-height:1.8;color:#374151;">${analysis.summary}</p>
      </div>

      <h2 style="font-size:14px;font-weight:700;color:#1e3a5f;margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">الشركات في الشبكة</h2>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:24px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:8px 10px;text-align:right;font-weight:600;">الشركة</th>
            <th style="padding:8px 10px;text-align:center;font-weight:600;">القطاع</th>
            <th style="padding:8px 10px;text-align:left;font-weight:600;">مستحق الدفع</th>
            <th style="padding:8px 10px;text-align:left;font-weight:600;">مستحق القبض</th>
          </tr>
        </thead>
        <tbody>${companyRows}</tbody>
      </table>

      <h2 style="font-size:14px;font-weight:700;color:#1e3a5f;margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">مؤشرات المخاطر</h2>
      <div style="margin-bottom:24px;">${riskRows}</div>

      <h2 style="font-size:14px;font-weight:700;color:#1e3a5f;margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">التوصيات</h2>
      <div style="margin-bottom:24px;">${recommendationRows}</div>

      <h2 style="font-size:14px;font-weight:700;color:#1e3a5f;margin:0 0 10px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">رؤى مالية</h2>
      <div style="margin-bottom:16px;">${insightRows}</div>

      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:10px;color:#9ca3af;">
        <p style="margin:0;">تقرير صادر عن منصة توازن — تحليل مقاصة متعددة الأطراف</p>
        <p style="margin:4px 0 0;">الأرقام محسوبة خوارزمياً — التحليل النوعي مدعوم بـ GPT-4o</p>
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
