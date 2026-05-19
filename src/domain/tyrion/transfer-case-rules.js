import { DOCUMENT_TYPES } from './document-types.js'

export const TRANSFER_CASE_SUBTYPES = {
  TRANSFERENCIA_ESTANDAR: 'transferencia_estandar',
  TRANSFERENCIA_SUCESION: 'transferencia_sucesion',
  INDETERMINADO: 'indeterminado',
}

export const CANONICAL_TRANSFER_FIELDS = [
  { key: 'case_subtype', criticality: 'high' },
  { key: 'document_type', criticality: 'high' },
  { key: 'person_role', criticality: 'high' },
  { key: 'full_name', criticality: 'high' },
  { key: 'id_number', criticality: 'high' },
  { key: 'address', criticality: 'medium' },
  { key: 'postal_code', criticality: 'low' },
  { key: 'city', criticality: 'medium' },
  { key: 'province', criticality: 'low' },
  { key: 'license_plate', criticality: 'high' },
  { key: 'vin', criticality: 'high' },
  { key: 'vehicle_make', criticality: 'medium' },
  { key: 'vehicle_model', criticality: 'medium' },
  { key: 'vehicle_type', criticality: 'low' },
  { key: 'engine_cc', criticality: 'low' },
  { key: 'registration_date', criticality: 'medium' },
  { key: 'filing_date', criticality: 'medium' },
  { key: 'signature_date', criticality: 'medium' },
  { key: 'death_date', criticality: 'high' },
  { key: 'tax_model', criticality: 'high' },
  { key: 'tax_amount', criticality: 'medium' },
  { key: 'declared_value', criticality: 'medium' },
  { key: 'case_reference', criticality: 'medium' },
  { key: 'fee_reference', criticality: 'medium' },
  { key: 'document_confidence', criticality: 'high' },
]

export const NUCLEAR_DOCUMENT_RULES = [
  {
    type: DOCUMENT_TYPES.CTI_TRANSFERENCIA,
    subtype: TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_ESTANDAR,
    nuclear: true,
    extracts: ['buyer_name', 'buyer_id', 'seller_name', 'seller_id', 'license_plate', 'vin', 'filing_date', 'registration_date', 'case_reference', 'fee_reference'],
    crossChecks: ['buyer_identity', 'seller_identity', 'vehicle_identity', 'registration_date', 'standard_tax_context'],
  },
  {
    type: DOCUMENT_TYPES.MODELO_620,
    subtype: TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_ESTANDAR,
    nuclear: true,
    extracts: ['buyer_name', 'buyer_id', 'seller_name', 'seller_id', 'buyer_address', 'seller_address', 'license_plate', 'vin', 'vehicle_make', 'vehicle_model', 'registration_date', 'declared_value', 'tax_amount', 'filing_date', 'case_reference', 'fee_reference'],
    crossChecks: ['buyer_identity', 'seller_identity', 'vehicle_identity', 'registration_date', 'standard_tax_context'],
  },
  {
    type: DOCUMENT_TYPES.CTI_HERENCIA,
    subtype: TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_SUCESION,
    nuclear: true,
    extracts: ['heir_name', 'heir_id', 'deceased_name', 'deceased_id', 'license_plate', 'vin', 'filing_date', 'registration_date', 'case_reference', 'fee_reference'],
    crossChecks: ['heir_identity', 'deceased_identity', 'vehicle_identity', 'succession_context'],
  },
  {
    type: DOCUMENT_TYPES.MODELO_650,
    subtype: TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_SUCESION,
    nuclear: true,
    extracts: ['deceased_name', 'deceased_id', 'heir_name', 'tax_amount', 'declared_value', 'filing_date', 'case_reference'],
    crossChecks: ['deceased_identity', 'heir_identity', 'succession_context'],
  },
  {
    type: DOCUMENT_TYPES.RELACION_BIENES_650,
    subtype: TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_SUCESION,
    nuclear: true,
    extracts: ['deceased_name', 'declared_value', 'case_reference'],
    crossChecks: ['deceased_identity', 'succession_context'],
  },
  {
    type: DOCUMENT_TYPES.SOLICITUD_CAMBIO_FALLECIMIENTO,
    subtype: TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_SUCESION,
    nuclear: true,
    extracts: ['heir_name', 'heir_id', 'license_plate', 'signature_date'],
    crossChecks: ['heir_identity', 'vehicle_identity', 'chronology'],
  },
  {
    type: DOCUMENT_TYPES.CERTIFICADO_DEFUNCION,
    subtype: TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_SUCESION,
    nuclear: true,
    extracts: ['deceased_name', 'deceased_id', 'death_date'],
    crossChecks: ['deceased_identity', 'chronology', 'succession_context'],
  },
]

const RULES_BY_TYPE = Object.fromEntries(NUCLEAR_DOCUMENT_RULES.map((rule) => [rule.type, rule]))

function normalizeText(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))]
}

function getFields(document) {
  return document?.ai_payload?.extracted_fields || document?.extractedFields || {}
}

function getDocumentType(document) {
  return document?.document_type || document?.documentType || null
}

function getNormalizedDocumentText(document) {
  return document?.ai_payload?.normalized_text || document?.normalizedText || ''
}

function collectByRole(documents = [], mapper) {
  return unique(documents.flatMap((document) => mapper(getFields(document), document) || []).map(normalizeText).filter(Boolean))
}

function collectRaw(documents = [], mapper) {
  return unique(documents.flatMap((document) => mapper(getFields(document), document) || []).map((v) => String(v || '').trim()).filter(Boolean))
}

function compareSingleValueSet(values = []) {
  return values.length <= 1
}

function classifySubtype(documentTypes = []) {
  const set = new Set(documentTypes)
  if (set.has(DOCUMENT_TYPES.CTI_HERENCIA) && (set.has(DOCUMENT_TYPES.MODELO_650) || set.has(DOCUMENT_TYPES.CERTIFICADO_DEFUNCION))) {
    return { subtype: TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_SUCESION, confidence: 0.95 }
  }
  if (set.has(DOCUMENT_TYPES.MODELO_650) && set.has(DOCUMENT_TYPES.SOLICITUD_CAMBIO_FALLECIMIENTO) && set.has(DOCUMENT_TYPES.CERTIFICADO_DEFUNCION)) {
    return { subtype: TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_SUCESION, confidence: 0.94 }
  }
  if (set.has(DOCUMENT_TYPES.CTI_TRANSFERENCIA) && set.has(DOCUMENT_TYPES.MODELO_620)) {
    return { subtype: TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_ESTANDAR, confidence: 0.93 }
  }
  return { subtype: TRANSFER_CASE_SUBTYPES.INDETERMINADO, confidence: 0.4 }
}

export function getNuclearDocumentRule(type) {
  return RULES_BY_TYPE[type] || null
}

export function inferTransferCaseSubtype(documents = []) {
  const documentTypes = documents.map(getDocumentType).filter(Boolean)
  return classifySubtype(documentTypes)
}

export function evaluateTransferCrossChecks(documents = []) {
  const subtypeInfo = inferTransferCaseSubtype(documents)
  const plates = collectByRole(documents, (fields) => fields.plates || [])
  const vins = collectByRole(documents, (fields) => (fields.vin ? [fields.vin] : []))
  const buyerNames = collectByRole(documents, (fields, document) => {
    const type = getDocumentType(document)
    if ([DOCUMENT_TYPES.CTI_TRANSFERENCIA, DOCUMENT_TYPES.MODELO_620].includes(type)) return [fields.buyerName]
    return []
  })
  const buyerIds = collectByRole(documents, (fields, document) => {
    const type = getDocumentType(document)
    if ([DOCUMENT_TYPES.CTI_TRANSFERENCIA, DOCUMENT_TYPES.MODELO_620].includes(type)) return [fields.buyerId, ...(fields.buyerId ? [] : (fields.dniList || []).slice(0, 1))]
    return []
  })
  const sellerIds = collectByRole(documents, (fields, document) => {
    const type = getDocumentType(document)
    if ([DOCUMENT_TYPES.CTI_TRANSFERENCIA, DOCUMENT_TYPES.MODELO_620].includes(type)) return [fields.sellerId]
    return []
  })
  const sellerNames = collectByRole(documents, (fields, document) => {
    const type = getDocumentType(document)
    if ([DOCUMENT_TYPES.CTI_TRANSFERENCIA, DOCUMENT_TYPES.MODELO_620].includes(type)) return [fields.sellerName]
    return []
  })
  const heirNames = collectByRole(documents, (fields, document) => {
    const type = getDocumentType(document)
    if ([DOCUMENT_TYPES.CTI_HERENCIA, DOCUMENT_TYPES.SOLICITUD_CAMBIO_FALLECIMIENTO].includes(type)) return [fields.buyerName || fields.ownerName]
    if (type === DOCUMENT_TYPES.MODELO_650) return [fields.heirName]
    return []
  })
  const heirIds = collectByRole(documents, (fields, document) => {
    const type = getDocumentType(document)
    if ([DOCUMENT_TYPES.CTI_HERENCIA, DOCUMENT_TYPES.SOLICITUD_CAMBIO_FALLECIMIENTO, DOCUMENT_TYPES.MODELO_650].includes(type)) {
      return [fields.heirId || fields.buyerId]
    }
    return []
  })
  const deceasedNames = collectByRole(documents, (fields, document) => {
    const type = getDocumentType(document)
    if ([DOCUMENT_TYPES.CTI_HERENCIA, DOCUMENT_TYPES.MODELO_650, DOCUMENT_TYPES.RELACION_BIENES_650, DOCUMENT_TYPES.CERTIFICADO_DEFUNCION].includes(type)) {
      return [fields.sellerName || fields.ownerName || fields.deceasedName]
    }
    return []
  })
  const deceasedIds = collectByRole(documents, (fields, document) => {
    const type = getDocumentType(document)
    if ([DOCUMENT_TYPES.CTI_HERENCIA, DOCUMENT_TYPES.MODELO_650, DOCUMENT_TYPES.CERTIFICADO_DEFUNCION].includes(type)) {
      return [fields.deceasedId || fields.sellerId]
    }
    return []
  })
  const deathDates = unique(documents.flatMap((document) => {
    const fields = getFields(document)
    return fields.deathDate ? [fields.deathDate] : []
  }))
  const filingDates = collectRaw(documents, (fields) => {
    return [fields.date, fields.signatureDate, fields.registrationDate]
  })
  const normalizedTexts = documents.map(getNormalizedDocumentText).join(' ')

  const results = [
    {
      code: 'license_plate_consistency',
      severity: 'blocking',
      status: compareSingleValueSet(plates) ? 'passed' : 'failed',
      detail: compareSingleValueSet(plates) ? (plates[0] ? `Matrícula detectada: ${plates[0]}` : 'Sin matrícula suficiente para validar.') : `Matrículas distintas: ${plates.join(', ')}`,
    },
    {
      code: 'vin_consistency',
      severity: 'blocking',
      status: compareSingleValueSet(vins) ? 'passed' : 'failed',
      detail: compareSingleValueSet(vins) ? (vins[0] ? `Bastidor detectado: ${vins[0]}` : 'Sin bastidor suficiente para validar.') : `Bastidores distintos: ${vins.join(', ')}`,
    },
  ]

  if (subtypeInfo.subtype === TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_ESTANDAR) {
    results.push(
      {
        code: 'buyer_identity_match',
        severity: 'blocking',
        status: compareSingleValueSet(buyerNames) && compareSingleValueSet(buyerIds) ? 'passed' : 'failed',
        detail: compareSingleValueSet(buyerNames) && compareSingleValueSet(buyerIds) ? `Adquirente: ${buyerNames[0] || 'sin dato'} · DNI: ${buyerIds[0] || 'sin dato'}` : `Discrepancia de adquirente: ${buyerNames.join(' / ')} · DNI ${buyerIds.join(' / ')}`,
      },
      {
        code: 'seller_identity_match',
        severity: 'blocking',
        status: compareSingleValueSet(sellerNames) && compareSingleValueSet(sellerIds) ? 'passed' : 'failed',
        detail: compareSingleValueSet(sellerNames) && compareSingleValueSet(sellerIds) ? `Transmitente: ${sellerNames[0] || 'sin dato'} · DNI: ${sellerIds[0] || 'sin dato'}` : `Discrepancia de transmitente: ${sellerNames.join(' / ')} · DNI ${sellerIds.join(' / ')}`,
      },
      {
        code: 'standard_tax_context',
        severity: 'blocking',
        status: normalizedTexts.includes('modelo 620') ? 'passed' : 'failed',
        detail: normalizedTexts.includes('modelo 620') ? 'Contexto fiscal estándar detectado (Modelo 620).' : 'No se detectó Modelo 620 en un expediente clasificado como transferencia estándar.',
      },
    )
  }

  if (subtypeInfo.subtype === TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_SUCESION) {
    results.push(
      {
        code: 'heir_identity_match',
        severity: 'blocking',
        status: compareSingleValueSet(heirNames) && compareSingleValueSet(heirIds) ? 'passed' : 'failed',
        detail: compareSingleValueSet(heirNames) && compareSingleValueSet(heirIds) ? `Heredero/solicitante: ${heirNames[0] || 'sin dato'} · DNI: ${heirIds[0] || 'sin dato'}` : `Discrepancia de heredero/solicitante: ${heirNames.join(' / ')} · DNI ${heirIds.join(' / ')}`,
      },
      {
        code: 'deceased_identity_match',
        severity: 'blocking',
        status: compareSingleValueSet(deceasedNames) && compareSingleValueSet(deceasedIds) ? 'passed' : 'failed',
        detail: compareSingleValueSet(deceasedNames) && compareSingleValueSet(deceasedIds) ? `Causante/fallecido: ${deceasedNames[0] || 'sin dato'} · DNI: ${deceasedIds[0] || 'sin dato'}` : `Discrepancia de causante/fallecido: ${deceasedNames.join(' / ')} · DNI ${deceasedIds.join(' / ')}`,
      },
      {
        code: 'succession_context',
        severity: 'blocking',
        status: normalizedTexts.includes('modelo 650') || normalizedTexts.includes('defuncion') || normalizedTexts.includes('fallecimiento') ? 'passed' : 'failed',
        detail: normalizedTexts.includes('modelo 650') || normalizedTexts.includes('defuncion') || normalizedTexts.includes('fallecimiento') ? 'Contexto de sucesión detectado.' : 'Falta contexto documental claro de sucesión.',
      },
      {
        code: 'chronology',
        severity: 'blocking',
        status: deathDates.length === 0 || filingDates.length === 0 ? 'passed' : 'passed',
        detail: deathDates.length === 0 || filingDates.length === 0 ? 'Sin fechas suficientes para validar cronología.' : `Fecha defunción: ${deathDates[0]} · fechas expediente: ${filingDates.join(', ')}`,
      },
    )
  }

  return {
    subtype: subtypeInfo.subtype,
    subtypeConfidence: subtypeInfo.confidence,
    nuclearDocuments: documents.map(getDocumentType).filter((type) => getNuclearDocumentRule(type)),
    validations: results,
    blockingIssues: results.filter((item) => item.status === 'failed' && item.severity === 'blocking'),
  }
}
