import { supabase } from '../lib/supabase'
import { analyzeDocument, buildSimulatedOcrText } from '../domain/tyrion/index.js'
import { inspectDocument } from '../lib/document-ingestion'
import { logEvent } from './history'

const BUCKET = 'case-documents'

function isSupportedDocument(doc) {
  const fileName = String(doc?.file_name || '').toLowerCase()
  const fileType = String(doc?.file_type || '').toLowerCase()
  return fileType === 'application/pdf' || fileType.startsWith('image/') || fileName.endsWith('.pdf')
}

function isLegacyNoiseDocument(doc) {
  const fileName = String(doc?.file_name || '').toLowerCase()
  return fileName === 'test-upload.txt' || !isSupportedDocument(doc)
}

export async function fetchDocuments(caseId) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).filter((doc) => !isLegacyNoiseDocument(doc))
}

export async function deleteLegacyNoiseDocuments(caseId) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('case_id', caseId)

  if (error) throw error

  const noisy = (data || []).filter((doc) => isLegacyNoiseDocument(doc) || String(doc.file_name || '').toLowerCase() === 'test-upload.txt')
  if (!noisy.length) return 0

  for (const doc of noisy) {
    await deleteDocument(doc.id)
  }

  return noisy.length
}

export async function getDocumentSignedUrl(doc) {
  if (!doc?.storage_path) return null

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.storage_path, 3600)
  if (error) throw error
  return data?.signedUrl
}

export async function uploadDocument({ caseId, organizationId, file }) {
  if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) {
    throw new Error(`Formato no permitido para MVP: ${file.name}. Sube PDF o imagen.`)
  }

  const { data: existing, error: existingError } = await supabase
    .from('documents')
    .select('id, file_name, file_type, storage_path')
    .eq('case_id', caseId)
    .eq('file_name', file.name)
    .eq('file_type', file.type || 'application/octet-stream')
    .limit(1)
    .maybeSingle()

  if (existingError) throw existingError
  if (existing) {
    return {
      ...existing,
      skipped_duplicate: true,
    }
  }

  const name = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${caseId}/${Date.now()}-${name}`

  const upload = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
  if (upload.error) throw upload.error

  const inspection = await inspectDocument(file)
  const rawDocumentText = inspection.text?.trim() ? inspection.text : buildSimulatedOcrText(file)
  const analysis = inspection.analysis || analyzeDocument({ fileName: file.name, ocrText: rawDocumentText })
  const documentType = analysis.documentType
  const confidence = analysis.confidence

  const { data, error } = await supabase
    .from('documents')
    .insert({
      case_id: caseId,
      organization_id: organizationId,
      file_name: file.name,
      file_type: file.type || 'application/octet-stream',
      source_channel: 'manual',
      storage_path: path,
      status: 'ai_extracted',
      document_type: documentType,
      confidence,
      ocr_text: rawDocumentText,
      ai_payload: {
        engine: 'tyrion_document_intelligence_v2',
        document_type: documentType,
        confidence,
        extracted_fields: analysis.extractedFields,
        normalized_text: analysis.normalizedText,
        canonical_type: analysis.canonicalType,
        tramite_hints: analysis.tramiteHints,
        catalog_entry: analysis.catalogEntry,
        ingestion_source: inspection.source,
        ingestion_document_kind: inspection.documentKind,
        ingestion_page_count: inspection.pageCount,
        ingestion_pages_processed: inspection.pagesProcessed,
        ingestion_warnings: inspection.warnings,
        ingestion_error: inspection.error,
      },
    })
    .select()
    .single()

  if (error) throw error

  await supabase.rpc('sync_document_to_checklist', { p_document_id: data.id })

  await logEvent({
    organizationId,
    caseId,
    documentId: data.id,
    action: 'document_uploaded',
    entityType: 'document',
    entityId: data.id,
    metadata: {
      file_name: file.name,
      document_type: documentType,
      confidence,
      extracted_fields: analysis.extractedFields,
      canonical_type: analysis.canonicalType,
      tramite_hints: analysis.tramiteHints,
      ingestion_source: inspection.source,
      ingestion_warnings: inspection.warnings,
    },
  })

  return data
}

export async function deleteDocument(documentId) {
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (fetchError) throw fetchError

  if (document?.storage_path) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([document.storage_path])
    if (storageError) throw storageError
  }

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (error) throw error

  await logEvent({
    organizationId: document.organization_id,
    caseId: document.case_id,
    documentId: document.id,
    action: 'document_deleted',
    entityType: 'document',
    entityId: document.id,
    metadata: {
      file_name: document.file_name,
      storage_path: document.storage_path,
    },
  })

  return true
}

export async function updateDocumentExtraction(documentId, payload = {}) {
  const { ai_payload, ...rest } = payload
  const updatePayload = {
    ...rest,
  }

  if (ai_payload) updatePayload.ai_payload = ai_payload

  const { data, error } = await supabase
    .from('documents')
    .update(updatePayload)
    .eq('id', documentId)
    .select()
    .single()

  if (error) throw error

  await logEvent({
    organizationId: data.organization_id,
    caseId: data.case_id,
    documentId: data.id,
    action: 'document_extraction_corrected',
    entityType: 'document',
    entityId: data.id,
    metadata: {
      document_type: data.document_type,
      confidence: data.confidence,
      extracted_fields: data.ai_payload?.extracted_fields || {},
    },
  })

  return data
}
