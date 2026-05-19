const SEVERITY_LABELS = {
  blocking: 'Bloqueante',
  review: 'Revisable',
  info: 'Informativo',
}

const CONFLICT_TITLES = {
  license_plate_consistency: 'Matrícula inconsistente',
  vin_consistency: 'Bastidor inconsistente',
  buyer_identity_match: 'Identidad del adquirente inconsistente',
  seller_identity_match: 'Identidad del transmitente inconsistente',
  heir_identity_match: 'Identidad del heredero/solicitante inconsistente',
  deceased_identity_match: 'Identidad del causante/fallecido inconsistente',
  standard_tax_context: 'Contexto fiscal estándar incompleto',
  succession_context: 'Contexto sucesorio incompleto',
  chronology: 'Cronología del expediente a revisar',
}

const ACTION_HINTS = {
  license_plate_consistency: 'Revisar qué documento pertenece realmente al expediente y confirmar la matrícula correcta.',
  vin_consistency: 'Comprobar bastidor entre documentos del vehículo antes de continuar.',
  buyer_identity_match: 'Revisar DNI y nombre del adquirente en CTI y modelo fiscal.',
  seller_identity_match: 'Revisar DNI y nombre del transmitente en CTI y modelo fiscal.',
  heir_identity_match: 'Revisar heredero/solicitante entre CTI, solicitud y modelo sucesorio.',
  deceased_identity_match: 'Revisar causante/fallecido entre CTI, modelo 650 y certificado de defunción.',
  standard_tax_context: 'Confirmar que el expediente estándar tiene soporte fiscal coherente.',
  succession_context: 'Confirmar que el expediente por sucesión tiene soporte de fallecimiento y sucesiones.',
  chronology: 'Verificar fechas clave del expediente antes de avanzar.',
}

function inferDocumentsInvolved(code) {
  const map = {
    license_plate_consistency: ['documentos_nucleo'],
    vin_consistency: ['documentos_nucleo'],
    buyer_identity_match: ['cti_transferencia', 'modelo_620'],
    seller_identity_match: ['cti_transferencia', 'modelo_620'],
    heir_identity_match: ['cti_herencia', 'solicitud_cambio_fallecimiento', 'modelo_650'],
    deceased_identity_match: ['cti_herencia', 'modelo_650', 'certificado_defuncion'],
    standard_tax_context: ['cti_transferencia', 'modelo_620'],
    succession_context: ['cti_herencia', 'modelo_650', 'certificado_defuncion'],
    chronology: ['certificado_defuncion', 'solicitud_cambio_fallecimiento', 'cti_herencia'],
  }

  return map[code] || ['documentos_nucleo']
}

export function buildUiConflictItem(validation) {
  const severity = validation?.severity || 'review'
  return {
    code: validation?.code || 'unknown_conflict',
    title: CONFLICT_TITLES[validation?.code] || validation?.label || validation?.code || 'Conflicto detectado',
    severity,
    severityLabel: SEVERITY_LABELS[severity] || severity,
    summary: validation?.detail || 'Se detectó una discrepancia que requiere revisión.',
    status: validation?.status || 'failed',
    documentsInvolved: inferDocumentsInvolved(validation?.code),
    valuesDetected: validation?.detail || null,
    recommendedAction: ACTION_HINTS[validation?.code] || 'Revisar manualmente este conflicto antes de continuar.',
  }
}

export function buildUiConflictSummary(validations = []) {
  const items = validations.filter((item) => item?.status === 'failed').map(buildUiConflictItem)
  return {
    blockedCount: items.filter((item) => item.severity === 'blocking').length,
    reviewCount: items.filter((item) => item.severity === 'review').length,
    infoCount: items.filter((item) => item.severity === 'info').length,
    items,
  }
}
