import { getHumanReviewLabel, getHumanReviewOwner } from './human-review-rules'
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPES } from './document-types'
import { getTramiteRequirement, TYRION_CASE_STATES } from './tramite-requirements'

function buildDocumentTypeSet(documents = []) {
  return new Set(documents.map((document) => document.document_type).filter(Boolean))
}

function getExtractedFields(document) {
  return document?.ai_payload?.extracted_fields || {}
}

function getFlatValues(documents = [], picker) {
  return [...new Set(documents.flatMap((document) => picker(getExtractedFields(document), document)).filter(Boolean))]
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function evaluateCrossDocumentValidations({ caseData, documents = [] }) {
  const validations = []
  const plates = getFlatValues(documents, (fields) => fields.plates || [])
  const vins = getFlatValues(documents, (fields) => (fields.vin ? [fields.vin] : []))
  const sellerNames = getFlatValues(documents, (fields, document) => {
    if (document.document_type === DOCUMENT_TYPES.CONTRATO_FACTURA && fields.sellerName) return [fields.sellerName]
    if (document.document_type === DOCUMENT_TYPES.DNI_VENDEDOR && fields.names?.[0]) return [fields.names[0]]
    return []
  })
  const buyerNames = getFlatValues(documents, (fields, document) => {
    if (document.document_type === DOCUMENT_TYPES.CONTRATO_FACTURA && fields.buyerName) return [fields.buyerName]
    if (document.document_type === DOCUMENT_TYPES.DNI_COMPRADOR && fields.names?.[0]) return [fields.names[0]]
    return []
  })
  const ownerNames = getFlatValues(documents, (fields) => (fields.ownerName ? [fields.ownerName] : []))

  validations.push({
    code: 'plate_consistency',
    label: 'Matrícula coherente entre documentos',
    status: plates.length <= 1 ? 'passed' : 'failed',
    detail:
      plates.length <= 1
        ? plates[0]
          ? `Matrícula detectada: ${plates[0]}`
          : 'Sin matrícula suficiente para validar.'
        : `Se detectaron matrículas distintas: ${plates.join(', ')}`,
  })

  validations.push({
    code: 'vin_consistency',
    label: 'Bastidor coherente entre documentos',
    status: vins.length <= 1 ? 'passed' : 'failed',
    detail:
      vins.length <= 1
        ? vins[0]
          ? `Bastidor detectado: ${vins[0]}`
          : 'Sin bastidor suficiente para validar.'
        : `Se detectaron bastidores distintos: ${vins.join(', ')}`,
  })

  if (caseData?.case_type === 'transferencia') {
    validations.push({
      code: 'seller_identity_match',
      label: 'Coincidencia vendedor contrato ↔ identidad',
      status: sellerNames.length <= 1 ? 'passed' : 'failed',
      detail:
        sellerNames.length <= 1
          ? sellerNames[0]
            ? `Vendedor detectado: ${sellerNames[0]}`
            : 'Sin datos suficientes para validar vendedor.'
          : `Nombres de vendedor inconsistentes: ${sellerNames.join(' / ')}`,
    })

    validations.push({
      code: 'buyer_identity_match',
      label: 'Coincidencia comprador contrato ↔ identidad',
      status: buyerNames.length <= 1 ? 'passed' : 'failed',
      detail:
        buyerNames.length <= 1
          ? buyerNames[0]
            ? `Comprador detectado: ${buyerNames[0]}`
            : 'Sin datos suficientes para validar comprador.'
          : `Nombres de comprador inconsistentes: ${buyerNames.join(' / ')}`,
    })

    validations.push({
      code: 'owner_vs_contract',
      label: 'Titular del permiso coherente con la parte vendedora',
      status:
        ownerNames.length === 0 || sellerNames.length === 0 || ownerNames.some((owner) =>
          sellerNames.some((seller) => normalizeText(owner) === normalizeText(seller)),
        )
          ? 'passed'
          : 'failed',
      detail:
        ownerNames.length === 0 || sellerNames.length === 0
          ? 'Sin datos suficientes para validar titular/vendedor.'
          : `Titular detectado: ${ownerNames.join(', ')} · vendedor detectado: ${sellerNames.join(', ')}`,
    })
  }

  return validations
}

export function evaluateExpedient({ caseData, documents = [] }) {
  const requirement = getTramiteRequirement(caseData?.case_type, caseData)
  const documentTypes = buildDocumentTypeSet(documents)

  const missingRequiredDocuments = requirement.requiredDocuments.filter((type) => !documentTypes.has(type))
  const lowConfidenceDocuments = documents.filter((document) => Number(document.confidence ?? 0) < 0.85)
  const crossValidations = evaluateCrossDocumentValidations({ caseData, documents })
  const failedCrossValidations = crossValidations.filter((validation) => validation.status === 'failed')

  const escalations = []
  if (missingRequiredDocuments.length > 0) escalations.push('missing_required_documents')
  if (lowConfidenceDocuments.length > 0) escalations.push('low_confidence_documents')
  if (failedCrossValidations.length > 0) escalations.push('cross_document_inconsistency')
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
    automaticValidationResults: crossValidations,
    failedCrossValidations,
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
