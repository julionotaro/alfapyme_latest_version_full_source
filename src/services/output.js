import { supabase } from '../lib/supabase'

export async function fetchOutputQueue() {
  const { data, error } = await supabase
    .from('output_queue')
    .select('*, cases(public_id, client_name, vehicle_plate, status)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function fetchOutputBatches() {
  const { data, error } = await supabase.from('output_batches').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchBatchCases(batchId) {
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

  if (error) throw error
  return data || []
}

export async function fetchSessionCases(sessionId) {
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
  if (error) throw error
  return data || []
}

export async function fetchOutputStrategies() {
  const { data, error } = await supabase.from('output_strategies').select('*').order('case_type')
  if (error) throw error
  return data || []
}

export async function processOutputQueue() {
  const { data, error } = await supabase.rpc('process_output_queue')
  if (error) throw error
  return data
}

export async function updateSessionCase(id, payload) {
  const { data, error } = await supabase.from('output_session_cases').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function updateOutputJob(id, payload) {
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
  if (error) throw error
  return data
}

export async function downloadBatchCsv(batch) {
  const rows = await fetchBatchCases(batch.id)
  const lines = [
    ['expediente', 'cliente', 'matricula', 'tramite', 'estado_batch'],
    ...rows.map((row) => [
      row.cases?.public_id || '',
      row.cases?.client_name || '',
      row.cases?.vehicle_plate || '',
      row.cases?.case_type || '',
      row.status || '',
    ]),
  ]

  const csv = lines
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = batch.file_name || `batch_${batch.case_type || 'export'}.csv`
  anchor.click()
  URL.revokeObjectURL(url)

  await supabase
    .from('output_batches')
    .update({ status: 'exported', executed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', batch.id)

  return rows.length
}
