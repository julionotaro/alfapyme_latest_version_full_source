import { supabase } from '../lib/supabase'
import { DOCUMENT_TYPE_LABELS, getRequirementForCase } from '../domain/tyrion'
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

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function findChecklistMatch(checklist = [], documentType, label) {
  return checklist.find((item) => {
    const itemType = normalize(item.document_type || item.expected_document_type)
    const itemLabel = normalize(item.document_label)

    return itemType === normalize(documentType) || itemLabel === normalize(label)
  })
}

function findDocumentMatch(documents = [], documentType) {
  return documents.find((document) => normalize(document.document_type) === normalize(documentType)) || null
}

function resolveValidationStatus(document, isBlocking) {
  if (!document) return isBlocking ? 'missing' : 'optional'
  return Number(document.confidence ?? 0) < 0.85 ? 'needs_review' : 'pending'
}

function buildDesiredChecklistItems(requirement, documents = []) {
  const required = requirement.requiredDocuments.map((documentType) => ({
    expected_document_type: documentType,
    document_label: DOCUMENT_TYPE_LABELS[documentType] || documentType,
    is_blocking: true,
  }))

  const recommended = requirement.recommendedDocuments.map((documentType) => ({
    expected_document_type: documentType,
    document_label: DOCUMENT_TYPE_LABELS[documentType] || documentType,
    is_blocking: false,
  }))

  return [...required, ...recommended].map((item) => {
    const document = findDocumentMatch(documents, item.expected_document_type)

    return {
      ...item,
      status: document ? 'received' : 'missing',
      validation_status: resolveValidationStatus(document, item.is_blocking),
      document_id: document?.id || null,
    }
  })
}

function hasChecklistDiff(persisted, desired) {
  return [
    ['document_label', desired.document_label],
    ['expected_document_type', desired.expected_document_type],
    ['is_blocking', desired.is_blocking],
    ['status', desired.status],
    ['validation_status', desired.validation_status],
    ['document_id', desired.document_id],
  ].some(([key, value]) => (persisted?.[key] ?? null) !== (value ?? null))
}

async function reconcileChecklistTemplateFallback({ caseData, checklist = [], desiredItems = [] }) {
  let insertedCount = 0
  let updatedCount = 0

  for (const desired of desiredItems) {
    const persisted = findChecklistMatch(checklist, desired.expected_document_type, desired.document_label)

    if (!persisted) {
      const { error } = await supabase.from('case_document_checklist').insert({
        case_id: caseData.id,
        document_label: desired.document_label,
        expected_document_type: desired.expected_document_type,
        is_blocking: desired.is_blocking,
        status: desired.status,
        validation_status: desired.validation_status,
        document_id: desired.document_id,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
      insertedCount += 1
      continue
    }

    if (!hasChecklistDiff(persisted, desired)) continue

    const { error } = await supabase
      .from('case_document_checklist')
      .update({
        document_label: desired.document_label,
        expected_document_type: desired.expected_document_type,
        is_blocking: desired.is_blocking,
        status: desired.status,
        validation_status: desired.validation_status,
        document_id: desired.document_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', persisted.id)

    if (error) throw error
    updatedCount += 1
  }

  return { insertedCount, updatedCount, mode: 'client_fallback' }
}

export async function reconcileChecklistTemplate({ caseData, documents = [], checklist = [] }) {
  if (!caseData?.id) return checklist

  const requirement = getRequirementForCase(caseData)
  const desiredItems = buildDesiredChecklistItems(requirement, documents)

  let reconciliation = { insertedCount: 0, updatedCount: 0, mode: 'rpc' }

  const { data: rpcCount, error: rpcError } = await supabase.rpc('reconcile_case_checklist', {
    p_case_id: caseData.id,
    p_items: desiredItems,
  })

  if (rpcError) {
    reconciliation = await reconcileChecklistTemplateFallback({
      caseData,
      checklist,
      desiredItems,
    })
  } else {
    reconciliation = { insertedCount: Number(rpcCount || 0), updatedCount: 0, mode: 'rpc' }
  }

  if (reconciliation.insertedCount > 0 || reconciliation.updatedCount > 0) {
    await logEvent({
      organizationId: caseData.organization_id,
      caseId: caseData.id,
      action: 'checklist_template_reconciled',
      entityType: 'case_document_checklist',
      entityId: caseData.id,
      metadata: {
        requirement_code: requirement.code,
        inserted: reconciliation.insertedCount,
        updated: reconciliation.updatedCount,
        mode: reconciliation.mode,
      },
    })
  }

  return fetchChecklist(caseData.id)
}
