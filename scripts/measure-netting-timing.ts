/**
 * One-off timing benchmark — not part of the application.
 * Run: npx tsx scripts/measure-netting-timing.ts
 */
import 'dotenv/config'
import { performance } from 'node:perf_hooks'
import OpenAI from 'openai'
import { demoSampleCompanies as companies } from '../src/data/demo-data.ts'
import { debtRecords } from '../src/data/debts-mock.ts'
import { computeNetting } from '../server/lib/derive.ts'

// Mirror netting route helpers exactly (read-only copy for measurement)
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
  companies: unknown[],
  debtRecords: unknown[],
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

async function measureOnce() {
  const totalStart = performance.now()
  let t0 = totalStart

  // Validation (negligible, included in pre-OpenAI)
  if (!companies || !debtRecords) throw new Error('missing data')

  const computation = computeNetting(debtRecords)
  const { metrics, netTransfers } = computation

  const systemPrompt = buildSystemPrompt()
  const userMessage = buildUserMessage(companies, debtRecords, computation)
  const beforeOpenAI = performance.now()

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await client.responses.create({
    model: 'gpt-4o',
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    text: { format: { type: 'json_object' } },
  })

  const afterOpenAI = performance.now()
  const llm = JSON.parse(response.output_text)

  const recMap = new Map(
    (llm.opportunityRecommendations ?? []).map(
      (r: { transferId: string; recommendation: string }) => [r.transferId, r.recommendation],
    ),
  )
  const nettingOpportunities = netTransfers.map((tx) => ({
    companies: [tx.from, tx.to],
    netAmount: tx.amount,
    direction: `${tx.from} → ${tx.to}`,
    savings: tx.bilateralSavings,
    recommendation: recMap.get(tx.id) ?? 'تنفيذ التحويل المقترح وفق الجدول',
  }))
  const analysis = {
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
  const payload = JSON.stringify({ success: true, analysis })
  const totalEnd = performance.now()

  return {
    beforeOpenAIMs: beforeOpenAI - t0,
    openAIMs: afterOpenAI - beforeOpenAI,
    afterOpenAIMs: totalEnd - afterOpenAI,
    totalMs: totalEnd - totalStart,
    payloadBytes: Buffer.byteLength(payload),
    userMessageBytes: Buffer.byteLength(userMessage),
  }
}

function avg(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not set')
    process.exit(1)
  }

  const runs = 3
  const results = []
  for (let i = 0; i < runs; i++) {
    console.error(`Run ${i + 1}/${runs}...`)
    results.push(await measureOnce())
  }

  console.log(
    JSON.stringify(
      {
        runs,
        avgBeforeOpenAIMs: Math.round(avg(results.map((r) => r.beforeOpenAIMs))),
        avgOpenAIMs: Math.round(avg(results.map((r) => r.openAIMs))),
        avgAfterOpenAIMs: Math.round(avg(results.map((r) => r.afterOpenAIMs))),
        avgTotalMs: Math.round(avg(results.map((r) => r.totalMs))),
        userMessageBytes: results[0].userMessageBytes,
        responsePayloadBytes: results[0].payloadBytes,
        samples: results.map((r) => ({
          beforeOpenAIMs: Math.round(r.beforeOpenAIMs),
          openAIMs: Math.round(r.openAIMs),
          afterOpenAIMs: Math.round(r.afterOpenAIMs),
          totalMs: Math.round(r.totalMs),
        })),
      },
      null,
      2,
    ),
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
