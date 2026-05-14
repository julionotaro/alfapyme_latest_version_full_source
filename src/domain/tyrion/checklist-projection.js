import { DOCUMENT_TYPE_LABELS } from './document-types.js'

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

export function projectChecklistFromRequirement({ requirement, checklist = [], documents = [] }) {
  const projectedItems = []

  for (const documentType of requirement.requiredDocuments) {
    const label = DOCUMENT_TYPE_LABELS[documentType] || documentType
    const persisted = findChecklistMatch(checklist, documentType, label)
    const document = findDocumentMatch(documents, documentType)

    projectedItems.push({
      id: persisted?.id || `required:${documentType}`,
      source: persisted ? 'database' : 'template',
      document_type: documentType,
      document_label: persisted?.document_label || label,
      is_blocking: true,
      status: persisted?.status || (document ? 'received' : 'missing'),
      validation_status:
        persisted?.validation_status ||
        (document ? (Number(document.confidence ?? 0) < 0.85 ? 'needs_review' : 'pending') : 'missing'),
      document_id: persisted?.document_id || document?.id || null,
      confidence: document?.confidence ?? null,
    })
  }

  for (const documentType of requirement.recommendedDocuments) {
    const label = DOCUMENT_TYPE_LABELS[documentType] || documentType
    const persisted = findChecklistMatch(checklist, documentType, label)
    const document = findDocumentMatch(documents, documentType)

    projectedItems.push({
      id: persisted?.id || `recommended:${documentType}`,
      source: persisted ? 'database' : 'template',
      document_type: documentType,
      document_label: persisted?.document_label || label,
      is_blocking: false,
      status: persisted?.status || (document ? 'received' : 'missing'),
      validation_status:
        persisted?.validation_status ||
        (document ? (Number(document.confidence ?? 0) < 0.85 ? 'needs_review' : 'pending') : 'optional'),
      document_id: persisted?.document_id || document?.id || null,
      confidence: document?.confidence ?? null,
    })
  }

  const projectedKeys = new Set(projectedItems.map((item) => normalize(`${item.document_type}|${item.document_label}`)))
  const extraPersisted = checklist.filter((item) => {
    const key = normalize(`${item.document_type || item.expected_document_type}|${item.document_label}`)
    return !projectedKeys.has(key)
  })

  return [...projectedItems, ...extraPersisted]
}
