/**
 * Auto-generated enterprise demo artefacts (presentation + KPIs).
 * Regenerate with: npm run demo:generate
 * DO NOT hand-edit KPI numbers — they come from computeNetting().
 *
 * Full debt ledger lives in `./debt-records` and is loaded only when needed
 * (AI payload / scripts) so the main UI chunk stays lean.
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
