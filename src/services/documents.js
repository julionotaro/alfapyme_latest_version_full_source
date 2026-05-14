import { supabase } from '../lib/supabase'
import { analyzeDocument, buildSimulatedOcrText } from '../domain/tyrion/index.js'
import { logEvent } from './history'

const BUCKET = 'case-documents'
const TEXT_LIKE_EXTENSIONS = ['txt', 'md', 'csv', 'json']

async function extractRawDocumentText(file) {
  const extension = String(file?.name || '').split('.').pop()?.toLowerCase() || ''

  if (TEXT_LIKE_EXTENSIONS.includes(extension)) {
    try {
      const text = await file.text()
      if (text?.trim()) return text
    } catch {
      // fallback below
    }
  }

  return buildSimulatedOcrText(file)
}

export async function fetchDocuments(caseId) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getDocumentSignedUrl(doc) {
  if (!doc?.storage_path) return null

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.storage_path, 3600)
  if (error) throw error
  return data?.signedUrl
}

export async function uploadDocument({ caseId, organizationId, file }) {
  const name = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${caseId}/${Date.now()}-${name}`

  const upload = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
  if (upload.error) throw upload.error

  const rawDocumentText = await extractRawDocumentText(file)
  const analysis = analyzeDocument({ fileName: file.name, ocrText: rawDocumentText })
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
        engine: 'tyrion_document_intelligence_v1',
        document_type: documentType,
        confidence,
        extracted_fields: analysis.extractedFields,
        normalized_text: analysis.normalizedText,
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
    },
  })

  return data
}

