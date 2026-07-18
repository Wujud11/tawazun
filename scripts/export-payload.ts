import { writeFileSync } from 'node:fs'
import { demoCompanies as companies } from '../src/data/demo-data.ts'
import { debtRecords } from '../src/data/debts-mock.ts'

writeFileSync(
  'payload.json',
  JSON.stringify({ companies, debtRecords }),
)

console.log(
  `payload.json written (${companies.length} companies, ${debtRecords.length} debts)`,
)
