import { getHumanReviewLabel, getHumanReviewOwner } from './human-review-rules'
import { DOCUMENT_TYPE_LABELS } from './document-types'
import { getTramiteRequirement, TYRION_CASE_STATES } from './tramite-requirements'

function buildDocumentTypeSet(documents = []) {
  return new Set(documents.map((document) => document.document_type).filter(Boolean))
}

export function evaluateExpedient({ caseData, documents = [] }) {
  const requirement = getTramiteRequirement(caseData?.case_type, caseData)
  const documentTypes = buildDocumentTypeSet(documents)

  const missingRequiredDocuments = requirement.requiredDocuments.filter((type) => !documentTypes.has(type))
  const lowConfidenceDocuments = documents.filter((document) => Number(document.confidence ?? 0) < 0.85)

  const escalations = []
  if (missingRequiredDocuments.length > 0) escalations.push('missing_required_documents')
  if (lowConfidenceDocuments.length > 0) escalations.push('low_confidence_documents')
  if (requirement.family === 'bajas' && documents.length === 0) escalations.push('missing_core_vehicle_support')

  const actionableMissingDocuments = missingRequiredDocuments.map((type) => ({
    type,
    label: DOCUMENT_TYPE_LABELS[type] || type,
    requestedFrom: 'Cliente / operador documental',
  }))

  const actionableEscalations = [...new Set([...requirement.mandatoryHumanEscalations, ...escalations])].map((reason) => ({
    reason,
    label: getHumanReviewLabel(reason),
    owner: getHumanReviewOwner(reason),
  }))

  const decision = inferDecision({ missingRequiredDocuments, lowConfidenceDocuments, escalations })

  return {
    requirement,
    missingRequiredDocuments,
    actionableMissingDocuments,
    lowConfidenceDocuments,
    automaticValidations: requirement.automaticValidations,
    mandatoryHumanEscalations: requirement.mandatoryHumanEscalations,
    actionableEscalations,
    escalations,
    decision,
  }
}

function inferDecision({ missingRequiredDocuments, lowConfidenceDocuments, escalations }) {
  if (missingRequiredDocuments.length > 0) {
    return {
      targetState: TYRION_CASE_STATES.PENDING_DOCUMENTS,
      reason: 'faltan_documentos_obligatorios',
      canAutoAdvance: false,
      actionHint: 'Solicitar documentos faltantes antes de preparar salida.',
    }
  }

  if (lowConfidenceDocuments.length > 0 || escalations.length > 0) {
    return {
      targetState: TYRION_CASE_STATES.HUMAN_VALIDATION,
      reason: 'requiere_revision_humana',
      canAutoAdvance: false,
      actionHint: 'Escalar expediente a revisión humana antes de continuar.',
    }
  }

  return {
    targetState: TYRION_CASE_STATES.READY_FOR_OUTPUT,
    reason: 'completitud_minima_superada',
    canAutoAdvance: true,
    actionHint: 'Puede pasar a preparación de salida si no hay controles externos pendientes.',
  }
}
