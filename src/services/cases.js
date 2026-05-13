import { supabase } from '../lib/supabase'
import { logEvent } from './history'

export async function fetchCases() {
  const { data, error } = await supabase.from('cases').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateCaseStatus(caseId, status) {
  const { data, error } = await supabase
    .from('cases')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', caseId)
    .select()
    .single()

  if (error) throw error

  await logEvent({
    caseId,
    action: 'case_status_changed',
    entityType: 'case',
    entityId: caseId,
    metadata: { status },
  })

  return data
}

export async function fetchChecklist(caseId) {
  const { data, error } = await supabase
    .from('case_document_checklist')
    .select('*')
    .eq('case_id', caseId)
    .order('document_label')

  if (error) throw error
  return data || []
}

export async function updateChecklist(id, payload) {
  const { data, error } = await supabase
    .from('case_document_checklist')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
