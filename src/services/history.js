import { supabase } from '../lib/supabase'

export async function fetchCaseHistory(caseId) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function logEvent({
  organizationId = null,
  caseId,
  documentId = null,
  action,
  entityType,
  entityId,
  metadata = {},
}) {
  try {
    await supabase.from('audit_logs').insert({
      organization_id: organizationId,
      case_id: caseId,
      document_id: documentId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    })
  } catch (error) {
    console.warn(error)
  }
}
