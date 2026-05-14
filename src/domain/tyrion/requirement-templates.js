import { DOCUMENT_TYPES } from './document-types.js'

const BASE_DOCUMENT_INTAKE_TEMPLATE = {
  id: 'base_document_intake',
  label: 'Plantilla base documental',
  defaultRequirement: {
    code: 'GEN',
    family: 'generico',
    label: 'Trámite genérico',
    requiredDocuments: [DOCUMENT_TYPES.DOCUMENTO_TRAFICO],
    recommendedDocuments: [],
    automaticValidations: ['legibilidad', 'coherencia_basica'],
    mandatoryHumanEscalations: ['documentacion_ilegible', 'tramite_no_claro'],
  },
  requirements: {},
}

const GESTORIA_DGT_TEMPLATE = {
  ...BASE_DOCUMENT_INTAKE_TEMPLATE,
  id: 'gestoria_dgt',
  label: 'Gestoría DGT',
  requirements: {
    transferencia: {
      code: 'B1',
      family: 'cambios_titularidad',
      label: 'Transferencia de vehículo',
      requiredDocuments: [
        DOCUMENT_TYPES.CONTRATO_FACTURA,
        DOCUMENT_TYPES.PERMISO_CIRCULACION,
        DOCUMENT_TYPES.FICHA_TECNICA,
        DOCUMENT_TYPES.JUSTIFICANTE_PAGO,
      ],
      recommendedDocuments: [DOCUMENT_TYPES.DNI_COMPRADOR, DOCUMENT_TYPES.DNI_VENDEDOR],
      automaticValidations: ['identidad', 'titularidad', 'itv', 'impuestos', 'cargas_precintos'],
      mandatoryHumanEscalations: ['titularidad_ambigua', 'cargas_precintos', 'documentacion_ilegible'],
    },
    notificacion_venta: {
      code: 'B2',
      family: 'cambios_titularidad',
      label: 'Notificación de venta',
      requiredDocuments: [DOCUMENT_TYPES.CONTRATO_FACTURA, DOCUMENT_TYPES.JUSTIFICANTE_PAGO],
      recommendedDocuments: [DOCUMENT_TYPES.DNI_VENDEDOR],
      automaticValidations: ['identidad', 'coherencia_contractual', 'tasa'],
      mandatoryHumanEscalations: ['coherencia_contractual', 'documentacion_ilegible'],
    },
    aceptacion_venta: {
      code: 'B3',
      family: 'cambios_titularidad',
      label: 'Aceptación de venta',
      requiredDocuments: [DOCUMENT_TYPES.CONTRATO_FACTURA, DOCUMENT_TYPES.JUSTIFICANTE_PAGO],
      recommendedDocuments: [DOCUMENT_TYPES.DNI_COMPRADOR],
      automaticValidations: ['identidad', 'fiscalidad', 'coherencia_contractual'],
      mandatoryHumanEscalations: ['fiscalidad_ambigua', 'documentacion_ilegible'],
    },
    duplicado: {
      code: 'C1',
      family: 'documentacion_vehiculo',
      label: 'Duplicado del permiso de circulación',
      requiredDocuments: [DOCUMENT_TYPES.DNI, DOCUMENT_TYPES.DECLARACION_EXTRAVIO, DOCUMENT_TYPES.JUSTIFICANTE_PAGO],
      recommendedDocuments: [DOCUMENT_TYPES.PERMISO_CIRCULACION],
      automaticValidations: ['identidad', 'tasa'],
      mandatoryHumanEscalations: ['identidad_ambigua', 'documentacion_ilegible'],
    },
    cambio_domicilio: {
      code: 'C3',
      family: 'documentacion_vehiculo',
      label: 'Cambio de domicilio fiscal',
      requiredDocuments: [DOCUMENT_TYPES.DNI, DOCUMENT_TYPES.JUSTIFICANTE_DOMICILIO],
      recommendedDocuments: [],
      automaticValidations: ['identidad', 'coherencia_domicilio'],
      mandatoryHumanEscalations: ['coherencia_domicilio', 'documentacion_ilegible'],
    },
    baja_temporal: {
      code: 'D1',
      family: 'bajas',
      label: 'Baja temporal',
      requiredDocuments: [DOCUMENT_TYPES.PERMISO_CIRCULACION, DOCUMENT_TYPES.JUSTIFICANTE_PAGO],
      recommendedDocuments: [DOCUMENT_TYPES.DNI],
      automaticValidations: ['titularidad', 'estado_vehiculo', 'tasa'],
      mandatoryHumanEscalations: ['estado_vehiculo', 'documentacion_ilegible'],
    },
    baja_definitiva: {
      code: 'D2',
      family: 'bajas',
      label: 'Baja definitiva',
      requiredDocuments: [DOCUMENT_TYPES.CERTIFICADO_CAT],
      recommendedDocuments: [DOCUMENT_TYPES.PERMISO_CIRCULACION],
      automaticValidations: ['autenticidad_cat', 'titularidad_vehiculo'],
      mandatoryHumanEscalations: ['certificado_especial', 'documentacion_ilegible'],
    },
    matriculacion: {
      code: 'E1',
      family: 'matriculaciones',
      label: 'Matriculación ordinaria',
      requiredDocuments: [
        DOCUMENT_TYPES.DOCUMENTACION_EXTRANJERA,
        DOCUMENT_TYPES.COC_FICHA_REDUCIDA,
        DOCUMENT_TYPES.JUSTIFICANTE_PAGO,
      ],
      recommendedDocuments: [DOCUMENT_TYPES.DUA, DOCUMENT_TYPES.EMPADRONAMIENTO, DOCUMENT_TYPES.DNI],
      automaticValidations: ['identidad', 'origen_vehiculo', 'homologacion', 'fiscalidad'],
      mandatoryHumanEscalations: ['origen_vehiculo', 'homologacion_especial', 'documentacion_ilegible'],
    },
    matriculacion_importacion: {
      code: 'E2',
      family: 'matriculaciones',
      label: 'Matriculación por importación',
      requiredDocuments: [
        DOCUMENT_TYPES.DOCUMENTACION_EXTRANJERA,
        DOCUMENT_TYPES.COC_FICHA_REDUCIDA,
        DOCUMENT_TYPES.DUA,
        DOCUMENT_TYPES.JUSTIFICANTE_PAGO,
      ],
      recommendedDocuments: [DOCUMENT_TYPES.EMPADRONAMIENTO, DOCUMENT_TYPES.DNI],
      automaticValidations: ['identidad', 'origen_vehiculo', 'homologacion', 'aduanas', 'fiscalidad'],
      mandatoryHumanEscalations: ['origen_vehiculo', 'homologacion_especial', 'documentacion_ilegible'],
    },
  },
}

export const REQUIREMENT_TEMPLATES = {
  gestoria_dgt: GESTORIA_DGT_TEMPLATE,
}

function resolveTemplateKey(caseData) {
  return caseData?.requirement_template || caseData?.workflow_template || caseData?.business_line || 'gestoria_dgt'
}

export function getRequirementTemplate(caseData) {
  return REQUIREMENT_TEMPLATES[resolveTemplateKey(caseData)] || BASE_DOCUMENT_INTAKE_TEMPLATE
}

export function getRequirementForCase(caseData) {
  const template = getRequirementTemplate(caseData)
  return template.requirements[caseData?.case_type] || template.defaultRequirement
}

export { BASE_DOCUMENT_INTAKE_TEMPLATE, GESTORIA_DGT_TEMPLATE }
