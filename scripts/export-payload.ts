import { writeFileSync } from 'node:fs'
import { demoSampleCompanies as companies } from '../src/data/demo-data.ts'
import { debtRecords } from '../src/data/debts-mock.ts'

writeFileSync(
  'payload.json',
  JSON.stringify({ companies, debtRecords }),
)

console.log('payload.json written')
