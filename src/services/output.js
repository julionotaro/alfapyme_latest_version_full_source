import { supabase } from '../lib/supabase'
import { GESTORIA_DGT_TEMPLATE } from '../domain/tyrion/index.js'
import { getOutputStrategy } from '../domain/templates/index.js'
import { fetchCases, fetchChecklist } from './cases'
import { fetchDocuments } from './documents'
import { logEvent } from './history'
import { planOutputs } from '../domain/outputs/router'
import { buildCsvBatchGroups, buildCsvContent } from '../domain/outputs/executors/csv'
import { buildCopilotSessions } from '../domain/outputs/executors/copilot'
import { buildMessagingJobs } from '../domain/outputs/executors/messaging'

const LOCAL_OUTPUT_STATE_KEY = 'alfapyme.output.localState'

function readLocalState() {
  if (typeof window === 'undefined') return { sessions: {}, jobs: {}, batches: {} }

  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_OUTPUT_STATE_KEY) || '{"sessions":{},"jobs":{},"batches":{}}')
  } catch {
    return { sessions: {}, jobs: {}, batches: {} }
  }
}

function writeLocalState(state) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOCAL_OUTPUT_STATE_KEY, JSON.stringify(state))
}

function applySessionState(session) {
  const state = readLocalState()
  const override = state.sessions?.[session.id]
  if (!override) return session

  const rows = session.rows.map((row) => ({ ...row, ...(override.rows?.[row.id] || {}) }))
  const completed = rows.filter((row) => row.status === 'completed').length
  const failed = rows.filter((row) => row.status === 'failed').length

  return {
    ...session,
    rows,
    status: override.status || (completed === rows.length && rows.length > 0 ? 'completed' : failed > 0 ? 'attention' : 'in_progress'),
  }
}

function applyBatchState(batch) {
  const state = readLocalState()
  return { ...batch, ...(state.batches?.[batch.id] || {}) }
}

function applyJobState(job) {
  const state = readLocalState()
  return { ...job, ...(state.jobs?.[job.id] || {}) }
}

async function buildLocalOutputSnapshot() {
  const cases = await fetchCases()
  const checklistsByCase = {}
  const documentsByCase = {}

  for (const caseData of cases) {
    try {
      checklistsByCase[caseData.id] = await fetchChecklist(caseData.id)
    } catch {
      checklistsByCase[caseData.id] = []
    }

    try {
      documentsByCase[caseData.id] = await fetchDocuments(caseData.id)
    } catch {
      documentsByCase[caseData.id] = []
    }
  }

  const queue = planOutputs({ cases, checklistsByCase, documentsByCase })
  const batches = buildCsvBatchGroups(queue).map(applyBatchState)
  const sessions = buildCopilotSessions(queue).map(applySessionState)
  const jobs = buildMessagingJobs(cases).map(applyJobState)

  return { queue, batches, sessions, jobs }
}

function buildLocalOutputStrategies() {
  return Object.entries(GESTORIA_DGT_TEMPLATE.requirements).map(([caseType, requirement]) => ({
    case_type: caseType,
    requirement_code: requirement.code,
    requirement_family: requirement.family,
    requirement_label: requirement.label,
    ...getOutputStrategy({ case_type: caseType, requirement_template: 'gestoria_dgt' }),
    source: 'local_default',
  }))
}

export async function fetchOutputQueue() {
  const { data, error } = await supabase
    .from('output_queue')
    .select('*, cases(public_id, client_name, vehicle_plate, status)')
    .order('created_at', { ascending: false })

  if (error || !data?.length) {
    const snapshot = await buildLocalOutputSnapshot()
    return snapshot.queue
  }
  return data || []
}

export async function fetchOutputBatches() {
  const { data, error } = await supabase.from('output_batches').select('*').order('created_at', { ascending: false })
  if (error || !data?.length) {
    const snapshot = await buildLocalOutputSnapshot()
    return snapshot.batches
  }
  return data || []
}

export async function fetchBatchCases(batchId) {
  if (String(batchId).startsWith('local-batch:')) {
    const snapshot = await buildLocalOutputSnapshot()
    return snapshot.batches.find((batch) => batch.id === batchId)?.rows || []
  }

  const { data, error } = await supabase
    .from('output_batch_cases')
    .select('*, cases(public_id, client_name, vehicle_plate, case_type)')
    .eq('batch_id', batchId)
    .order('created_at')

  if (error) throw error
  return data || []
}

export async function fetchOutputSessions() {
  const { data, error } = await supabase
    .from('output_sessions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !data?.length) {
    const snapshot = await buildLocalOutputSnapshot()
    return snapshot.sessions
  }
  return data || []
}

export async function fetchSessionCases(sessionId) {
  if (String(sessionId).startsWith('local-session:')) {
    const snapshot = await buildLocalOutputSnapshot()
    return snapshot.sessions.find((session) => session.id === sessionId)?.rows || []
  }

  const { data, error } = await supabase
    .from('output_session_cases')
    .select('*, cases(public_id, client_name, vehicle_plate, case_type, status)')
    .eq('session_id', sessionId)
    .order('created_at')

  if (error) throw error
  return data || []
}

export async function fetchOutputJobs() {
  const { data, error } = await supabase.from('output_jobs').select('*').order('created_at', { ascending: false })
  if (error || !data?.length) {
    const snapshot = await buildLocalOutputSnapshot()
    return snapshot.jobs
  }
  return data || []
}

export async function fetchOutputStrategies() {
  const { data, error } = await supabase.from('output_strategies').select('*').order('case_type')
  if (error) throw error
  if (data?.length) return data
  return buildLocalOutputStrategies()
}

export async function processOutputQueue() {
  const { data, error } = await supabase.rpc('process_output_queue')
  if (error) {
    const snapshot = await buildLocalOutputSnapshot()
    return {
      ready: snapshot.queue.filter((item) => item.ready).length,
      blocked: snapshot.queue.filter((item) => !item.ready).length,
      batches: snapshot.batches.length,
      sessions: snapshot.sessions.length,
      jobs: snapshot.jobs.length,
      mode: 'local_planner',
    }
  }
  return data
}

export async function updateSessionCase(id, payload) {
  if (String(id).startsWith('local-session-case:')) {
    const state = readLocalState()
    const sessionEntry = Object.entries(state.sessions || {}).find(([, value]) => value.rows?.[id])

    if (sessionEntry) {
      const [sessionId, current] = sessionEntry
      state.sessions[sessionId] = {
        ...current,
        rows: {
          ...(current.rows || {}),
          [id]: { ...(current.rows?.[id] || {}), ...payload },
        },
      }
      writeLocalState(state)
    } else {
      const sessions = await fetchOutputSessions()
      const session = sessions.find((item) => item.rows?.some((row) => row.id === id))
      state.sessions[session?.id || 'unknown'] = {
        rows: { [id]: payload },
      }
      writeLocalState(state)
    }

    return { id, ...payload }
  }

  const { data, error } = await supabase.from('output_session_cases').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function updateOutputJob(id, payload) {
  if (String(id).startsWith('local-msg-')) {
    const state = readLocalState()
    state.jobs = {
      ...(state.jobs || {}),
      [id]: { ...(state.jobs?.[id] || {}), ...payload, updated_at: new Date().toISOString() },
    }
    writeLocalState(state)
    return { id, ...state.jobs[id] }
  }

  const { data, error } = await supabase
    .from('output_jobs')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function retryFailedJobs() {
  const { data, error } = await supabase.rpc('retry_failed_jobs')
  if (error) {
    const state = readLocalState()
    let retried = 0
    for (const [id, job] of Object.entries(state.jobs || {})) {
      if (job.status === 'failed') {
        state.jobs[id] = { ...job, status: 'draft', last_error: null, attempts: (job.attempts || 0) + 1 }
        retried += 1
      }
    }
    writeLocalState(state)
    return retried
  }
  return data
}

export async function downloadBatchCsv(batch) {
  const rows = await fetchBatchCases(batch.id)
  const csv = buildCsvContent(
    rows.map((row) => ({
      public_id: row.cases?.public_id || row.public_id,
      client_name: row.cases?.client_name || row.client_name,
      vehicle_plate: row.cases?.vehicle_plate || row.vehicle_plate,
      case_type: row.cases?.case_type || row.case_type,
      case_status: row.cases?.status || row.case_status || row.status,
      output_mode: batch.output_mode || 'csv_batch',
      destination_system: batch.destination_system,
    })),
  )

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = batch.file_name || `batch_${batch.case_type || 'export'}.csv`
  anchor.click()
  URL.revokeObjectURL(url)

  if (String(batch.id).startsWith('local-batch:')) {
    const state = readLocalState()
    state.batches = {
      ...(state.batches || {}),
      [batch.id]: { status: 'exported', executed_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    }
    writeLocalState(state)
    await logEvent({
      caseId: null,
      action: 'local_csv_batch_exported',
      entityType: 'output_batch',
      entityId: batch.id,
      metadata: { file_name: batch.file_name, total_rows: rows.length },
    })
    return rows.length
  }

  await supabase
    .from('output_batches')
    .update({ status: 'exported', executed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', batch.id)

  return rows.length
}
