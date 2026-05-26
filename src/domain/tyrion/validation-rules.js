import { getHumanReviewLabel, getHumanReviewOwner } from './human-review-rules.js'
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPES } from './document-types.js'
import { getTramiteRequirement, TYRION_CASE_STATES } from './tramite-requirements.js'
import { evaluateTransferCrossChecks, TRANSFER_CASE_SUBTYPES } from './transfer-case-rules.js'
import { buildUiConflictSummary } from './ui-conflicts.js'
import { shouldUseMvpDocumentReviewMode } from './mvp-mode.js'

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
  if (caseData?.case_type === 'transferencia') {
    const transferEvaluation = evaluateTransferCrossChecks(documents)
    if (transferEvaluation.subtype !== TRANSFER_CASE_SUBTYPES.INDETERMINADO) {
      return transferEvaluation.validations
    }
  }

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
  const addressValues = getFlatValues(documents, (fields) => (fields.address ? [fields.address] : []))

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

  if (caseData?.case_type === 'notificacion_venta' || caseData?.case_type === 'aceptacion_venta') {
    validations.push({
      code: 'contract_parties_present',
      label: 'Contrato con partes identificadas',
      status: sellerNames.length > 0 && buyerNames.length > 0 ? 'passed' : 'failed',
      detail:
        sellerNames.length > 0 && buyerNames.length > 0
          ? `Vendedor: ${sellerNames[0]} · Comprador: ${buyerNames[0]}`
          : 'Faltan datos de comprador o vendedor en la documentación contractual.',
    })
  }

  if (caseData?.case_type === 'baja_temporal' || caseData?.case_type === 'baja_definitiva') {
    validations.push({
      code: 'owner_identity_present',
      label: 'Titular o identidad principal presente',
      status: ownerNames.length > 0 || sellerNames.length > 0 ? 'passed' : 'failed',
      detail:
        ownerNames.length > 0 || sellerNames.length > 0
          ? `Identidad detectada: ${ownerNames[0] || sellerNames[0]}`
          : 'No se detectó identidad principal suficiente para la baja.',
    })
  }

  if (caseData?.case_type === 'matriculacion' || caseData?.case_type === 'matriculacion_importacion') {
    validations.push({
      code: 'vin_presence',
      label: 'Bastidor presente en documentación técnica',
      status: vins.length > 0 ? 'passed' : 'failed',
      detail: vins.length > 0 ? `Bastidor detectado: ${vins[0]}` : 'No se detectó bastidor suficiente.',
    })

    validations.push({
      code: 'address_presence',
      label: 'Domicilio detectado en soporte del solicitante',
      status: addressValues.length > 0 ? 'passed' : 'failed',
      detail:
        addressValues.length > 0 ? `Domicilio detectado: ${addressValues[0]}` : 'No se detectó domicilio suficiente.',
    })
  }

  if (caseData?.case_type === 'cambio_domicilio') {
    validations.push({
      code: 'address_presence',
      label: 'Domicilio detectado en justificante',
      status: addressValues.length > 0 ? 'passed' : 'failed',
      detail:
        addressValues.length > 0 ? `Domicilio detectado: ${addressValues[0]}` : 'No se detectó domicilio suficiente.',
    })
  }

  return validations
}

export function evaluateExpedient({ caseData, documents = [] }) {
  const requirement = getTramiteRequirement(caseData?.case_type, caseData)
  const mvpDocumentMode = shouldUseMvpDocumentReviewMode()
  const documentTypes = buildDocumentTypeSet(documents)

  const missingRequiredDocuments = requirement.requiredDocuments.filter((type) => !documentTypes.has(type))
  const lowConfidenceDocuments = documents.filter((document) => Number(document.confidence ?? 0) < 0.85)
  const crossValidations = evaluateCrossDocumentValidations({ caseData, documents })
  const failedCrossValidations = crossValidations.filter((validation) => validation.status === 'failed')
  const uiConflicts = buildUiConflictSummary(failedCrossValidations)

  const escalations = []
  if (!mvpDocumentMode && missingRequiredDocuments.length > 0) escalations.push('missing_required_documents')
  if (lowConfidenceDocuments.length > 0) escalations.push('low_confidence_documents')
  if (failedCrossValidations.length > 0) escalations.push('cross_document_inconsistency')
  if (requirement.family === 'bajas' && documents.length === 0) escalations.push('missing_core_vehicle_support')
  if (requirement.family === 'matriculaciones' && documents.length > 0 && failedCrossValidations.some((v) => ['vin_presence', 'address_presence'].includes(v.code))) {
    escalations.push('origen_vehiculo')
  }

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

  const decision = inferDecision({ missingRequiredDocuments, lowConfidenceDocuments, escalations, mvpDocumentMode })

  return {
    requirement,
    missingRequiredDocuments,
    actionableMissingDocuments,
    lowConfidenceDocuments,
    automaticValidations: requirement.automaticValidations,
    automaticValidationResults: crossValidations,
    failedCrossValidations,
    uiConflicts,
    mandatoryHumanEscalations: requirement.mandatoryHumanEscalations,
    actionableEscalations,
    escalations,
    decision,
    mvpDocumentMode,
  }
}

function inferDecision({ missingRequiredDocuments, lowConfidenceDocuments, escalations, mvpDocumentMode }) {
  if (!mvpDocumentMode && missingRequiredDocuments.length > 0) {
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
      actionHint: mvpDocumentMode
        ? 'Revisar contradicciones o documentos dudosos antes de continuar; los faltantes ideales quedan apartados en esta fase.'
        : 'Escalar expediente a revisión humana antes de continuar.',
    }
  }

  return {
    targetState: TYRION_CASE_STATES.READY_FOR_OUTPUT,
    reason: 'completitud_minima_superada',
    canAutoAdvance: true,
    actionHint: mvpDocumentMode
      ? 'Puede continuar mientras no haya contradicciones reales ni lectura dudosa relevante.'
      : 'Puede pasar a preparación de salida si no hay controles externos pendientes.',
  }
}
