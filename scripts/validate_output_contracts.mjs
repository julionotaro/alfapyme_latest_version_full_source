import { planCaseOutput } from '../src/domain/outputs/router.js'
import { buildCsvBatchGroups, buildCsvContent } from '../src/domain/outputs/executors/csv.js'
import { buildMessagingJobs } from '../src/domain/outputs/executors/messaging.js'

const readyCase = {
  id: 'case-ready',
  public_id: 'EXP-001',
  client_name: 'Julio Notaro',
  vehicle_plate: '1234ABC',
  case_type: 'transferencia',
  status: 'ready_for_output',
  business_template: 'gestoria_dgt',
  client_email: 'notaro.cnh@gmail.com',
}

const blockedMessageCase = {
  id: 'case-blocked',
  public_id: 'EXP-002',
  client_name: 'Cliente sin canal',
  case_type: 'transferencia',
  status: 'ready_for_output',
  business_template: 'gestoria_dgt',
  preferred_contact_channel: 'telegram',
}

const queueItem = planCaseOutput({ caseData: readyCase, checklist: [], documents: [] })
const csvGroups = buildCsvBatchGroups([queueItem])
const csv = buildCsvContent([queueItem])
const jobs = buildMessagingJobs([readyCase, blockedMessageCase])

const ok = [
  queueItem.ready,
  queueItem.payload_status === 'ready',
  csvGroups.length === 1,
  csv.includes('payload_status'),
  jobs.find((job) => job.id === 'local-msg-status:case-ready')?.status === 'draft',
  jobs.find((job) => job.id === 'local-msg-status:case-blocked')?.status === 'blocked',
].every(Boolean)

console.log(JSON.stringify({
  queueReady: queueItem.ready,
  csvGroups: csvGroups.length,
  blockedJobs: jobs.filter((job) => job.status === 'blocked').length,
  csvPreview: csv.split('\n').slice(0, 2),
}, null, 2))

if (!ok) process.exit(1)
