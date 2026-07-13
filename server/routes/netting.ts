import { Router, type Request, type Response } from 'express'
import OpenAI from 'openai'
import { computeNetting } from '../lib/derive.js'
import type { DebtRecord } from '../lib/derive.js'

// ─── Request type ─────────────────────────────────────────────────────────────

type Company = {
  id: string
  name: string
  nameEn: string
  sector: string
  netBalance: number
  totalPayable: number
  totalReceivable: number
  activeDebts: number
}

type NettingAnalysisRequest = {
  companies: Company[]
  debtRecords: DebtRecord[]
}

// ─── Final response shape (unchanged public contract) ─────────────────────────

export type NettingAnalysisResult = {
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
  nettingOpportunities: Array<{
    companies: string[]
    netAmount: number
    direction: string
    savings: number
    recommendation: string
  }>
  riskFlags: Array<{
    companyName: string
    risk: string
    description: string
    severity: 'low' | 'medium' | 'high'
  }>
  insights: string[]
}

// ─── What the LLM is asked to return (qualitative only — no numbers) ──────────

type LLMQualitativeOutput = {
  summary: string
  riskFlags: Array<{
    companyName: string
    risk: string
    description: string
    severity: 'low' | 'medium' | 'high'
  }>
  insights: string[]
  opportunityRecommendations: Array<{
    transferId: string
    recommendation: string
  }>
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const nettingRouter = Router()

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function buildSystemPrompt(): string {
  return `
You are a financial netting and debt analysis expert specialising in multi-party
settlement networks.

IMPORTANT — numerical calculations have already been performed by the server.
All computed metrics and net transfers are provided to you as verified facts.
Do NOT recalculate, modify, or contradict any of these numbers.

Your task is strictly qualitative: write an executive summary, assess risk per
company, produce actionable insights, and write a short recommendation for each
net transfer.

Rules:
- Respond with valid JSON only — no markdown, no code fences.
- All text fields (summary, descriptions, insights, recommendations) must be in Arabic.
- Do NOT output any metrics or amounts — the server will inject them.
- Each insight must be actionable, max 20 Arabic words.
- Risk severity: "high" for overdue obligations > 500,000 SAR, "medium" for
  overdue ≤ 500,000 SAR or high net-debtor position, "low" otherwise.

Return a JSON object that strictly follows this TypeScript type:
{
  summary: string;
  riskFlags: Array<{
    companyName: string;
    risk: string;           // snake_case tag, e.g. "overdue_obligations"
    description: string;    // Arabic explanation
    severity: "low" | "medium" | "high";
  }>;
  insights: string[];       // 3–5 items in Arabic
  opportunityRecommendations: Array<{
    transferId: string;     // must match one of the provided transfer IDs
    recommendation: string; // short Arabic action phrase
  }>;
}
  `.trim()
}

function buildUserMessage(
  companies: Company[],
  debtRecords: DebtRecord[],
  computation: ReturnType<typeof computeNetting>,
): string {
  const { metrics, netTransfers, companyBalances } = computation

  return JSON.stringify(
    {
      preComputedMetrics: {
        grossVolume_SAR: metrics.grossVolume,
        netVolume_SAR: metrics.netVolume,
        savings_SAR: metrics.savings,
        efficiencyPct: metrics.efficiencyPct,
        recommendedTransactions: metrics.recommendedTransactions,
        overdueCount: metrics.overdueCount,
        overdueVolume_SAR: metrics.overdueVolume,
      },
      netTransfers: netTransfers.map((t) => ({
        id: t.id,
        from: t.from,
        to: t.to,
        amount_SAR: t.amount,
        bilateralSavings_SAR: t.bilateralSavings,
      })),
      companyBalances,
      companies,
      debtRecords,
    },
    null,
    2,
  )
}

nettingRouter.post(
  '/netting-analysis',
  async (req: Request, res: Response): Promise<void> => {
    const body = req.body as Partial<NettingAnalysisRequest>

    if (!body.companies || !Array.isArray(body.companies)) {
      res.status(400).json({ error: 'Missing or invalid "companies" array.' })
      return
    }
    if (!body.debtRecords || !Array.isArray(body.debtRecords)) {
      res.status(400).json({ error: 'Missing or invalid "debtRecords" array.' })
      return
    }

    if (!process.env.OPENAI_API_KEY) {
      res
        .status(500)
        .json({ error: 'Server is not configured with an OpenAI API key.' })
      return
    }

    const { companies, debtRecords } = body as NettingAnalysisRequest

    // ── Step 1: compute all metrics server-side ───────────────────────────────
    const computation = computeNetting(debtRecords)
    const { metrics, netTransfers } = computation

    // ── Step 2: call OpenAI for qualitative analysis only ─────────────────────
    let llm: LLMQualitativeOutput

    try {
      const response = await client.responses.create({
        model: 'gpt-4o',
        input: [
          {
            role: 'system',
            content: buildSystemPrompt(),
          },
          {
            role: 'user',
            content: buildUserMessage(companies, debtRecords, computation),
          },
        ],
        text: {
          format: { type: 'json_object' },
        },
      })

      try {
        llm = JSON.parse(response.output_text) as LLMQualitativeOutput
      } catch {
        res.status(502).json({
          error: 'OpenAI returned non-JSON output.',
          raw: response.output_text,
        })
        return
      }
    } catch (err: unknown) {
      if (err instanceof OpenAI.APIError) {
        const status = err.status ?? 502
        res.status(status).json({
          error: err.message,
          code: err.code,
          type: err.type,
        })
        return
      }
      console.error('[netting-analysis] unexpected error:', err)
      res.status(500).json({ error: 'Internal server error.' })
      return
    }

    // ── Step 3: assemble final response — numbers from server, text from LLM ──

    const recMap = new Map(
      (llm.opportunityRecommendations ?? []).map((r) => [r.transferId, r.recommendation]),
    )

    const nettingOpportunities = netTransfers.map((tx) => ({
      companies: [tx.from, tx.to],
      netAmount: tx.amount,
      direction: `${tx.from} → ${tx.to}`,
      savings: tx.bilateralSavings,
      recommendation: recMap.get(tx.id) ?? 'تنفيذ التحويل المقترح وفق الجدول',
    }))

    const analysis: NettingAnalysisResult = {
      summary: llm.summary ?? '',
      metrics: {
        totalGrossVolume: metrics.grossVolume,
        totalNetVolume: metrics.netVolume,
        estimatedSavings: metrics.savings,
        efficiencyPct: metrics.efficiencyPct,
        recommendedTransactions: metrics.recommendedTransactions,
        overdueCount: metrics.overdueCount,
        overdueVolume: metrics.overdueVolume,
      },
      nettingOpportunities,
      riskFlags: llm.riskFlags ?? [],
      insights: llm.insights ?? [],
    }

    res.json({ success: true, analysis })
  },
)
