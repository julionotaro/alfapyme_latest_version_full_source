export const HUMAN_REVIEW_REASON_LABELS = {
  titularidad_ambigua: 'Titularidad ambigua o no concluyente',
  cargas_precintos: 'Revisar cargas o precintos',
  documentacion_ilegible: 'Documentación ilegible o incompleta',
  coherencia_contractual: 'Contrato con datos inconsistentes',
  fiscalidad_ambigua: 'Fiscalidad incompleta o ambigua',
  identidad_ambigua: 'Identidad no verificada con suficiente certeza',
  coherencia_domicilio: 'Domicilio no coherente o insuficiente',
  estado_vehiculo: 'Estado del vehículo requiere comprobación manual',
  certificado_especial: 'Documento especial que requiere validación manual',
  tramite_no_claro: 'Trámite no identificado con suficiente claridad',
  missing_required_documents: 'Faltan documentos obligatorios para el trámite',
  low_confidence_documents: 'Hay documentos con baja confianza de clasificación/extracción',
  missing_core_vehicle_support: 'Falta soporte documental base del vehículo',
  cross_document_inconsistency: 'Se detectaron incoherencias entre documentos del expediente',
  origen_vehiculo: 'El origen o procedencia del vehículo requiere revisión manual',
  homologacion_especial: 'La homologación o ficha reducida requiere validación manual',
}

export const HUMAN_REVIEW_OWNER_BY_REASON = {
  titularidad_ambigua: 'Gestor senior de titularidad',
  cargas_precintos: 'Gestor senior / control DGT',
  documentacion_ilegible: 'Operador documental',
  coherencia_contractual: 'Gestor de compraventa',
  fiscalidad_ambigua: 'Gestor fiscal / administrativo',
  identidad_ambigua: 'Operador documental',
  coherencia_domicilio: 'Gestor administrativo',
  estado_vehiculo: 'Gestor operativo de vehículo',
  certificado_especial: 'Gestor senior documental',
  tramite_no_claro: 'Gestor senior de triaje',
  missing_required_documents: 'Cliente / operador documental',
  low_confidence_documents: 'Operador documental',
  missing_core_vehicle_support: 'Cliente / operador documental',
  cross_document_inconsistency: 'Gestor senior de validación documental',
  origen_vehiculo: 'Gestor de importación / matriculación',
  homologacion_especial: 'Gestor técnico de homologación',
}

export function getHumanReviewLabel(reason) {
  return HUMAN_REVIEW_REASON_LABELS[reason] || reason
}

export function getHumanReviewOwner(reason) {
  return HUMAN_REVIEW_OWNER_BY_REASON[reason] || 'Revisión humana general'
}
