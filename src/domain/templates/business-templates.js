export const BUSINESS_TEMPLATE_IDS = {
  GESTORIA_DGT: 'gestoria_dgt',
  LOGISTICA_BASE: 'logistica_base',
  INMOBILIARIA_BASE: 'inmobiliaria_base',
  CONTABLE_BASE: 'contable_base',
}

import { WORKFLOW_STAGE_IDS } from './workflow-stages.js'

const BASE_TEMPLATE = {
  id: 'base_office_ops',
  vertical: 'generico',
  label: 'Base operativa de oficina',
  description: 'Plantilla base para procesos repetitivos de oficina con inputs, procesamiento y salidas.',
  inputChannels: ['web_upload'],
  processingStages: [
    WORKFLOW_STAGE_IDS.DOCUMENT_INGESTION,
    WORKFLOW_STAGE_IDS.DOCUMENT_CLASSIFICATION,
    WORKFLOW_STAGE_IDS.FIELD_EXTRACTION,
    WORKFLOW_STAGE_IDS.EXPEDIENT_VALIDATION,
    WORKFLOW_STAGE_IDS.HUMAN_REVIEW,
    WORKFLOW_STAGE_IDS.OUTPUT_PREPARATION,
  ],
  outputChannels: ['dashboard'],
  entities: ['case', 'document', 'task'],
  defaults: {
    ingestionMode: 'document_first',
    reviewPolicy: 'human_on_low_confidence',
  },
}

export const GESTORIA_DGT_BUSINESS_TEMPLATE = {
  ...BASE_TEMPLATE,
  id: BUSINESS_TEMPLATE_IDS.GESTORIA_DGT,
  vertical: 'gestoria',
  label: 'Gestoría · DGT',
  description: 'Plantilla semilla para expedientes de tráfico y documentación vehicular.',
  inputChannels: ['web_upload', 'email', 'manual_backoffice'],
  processingStages: [
    WORKFLOW_STAGE_IDS.DOCUMENT_INGESTION,
    WORKFLOW_STAGE_IDS.DOCUMENT_CLASSIFICATION,
    WORKFLOW_STAGE_IDS.FIELD_EXTRACTION,
    WORKFLOW_STAGE_IDS.EXPEDIENT_VALIDATION,
    WORKFLOW_STAGE_IDS.HUMAN_REVIEW,
    WORKFLOW_STAGE_IDS.OUTPUT_PREPARATION,
  ],
  outputChannels: ['dashboard', 'email', 'client_whatsapp', 'export_csv'],
  entities: ['case', 'document', 'checklist_item', 'output_job'],
}

export const LOGISTICA_BASE_BUSINESS_TEMPLATE = {
  ...BASE_TEMPLATE,
  id: BUSINESS_TEMPLATE_IDS.LOGISTICA_BASE,
  vertical: 'logistica',
  label: 'Logística · Operación base',
  description: 'Plantilla conceptual para rutas, pedidos, incidencias y comunicación operativa.',
  inputChannels: ['web_form', 'email', 'whatsapp', 'api', 'csv_import'],
  processingStages: [
    WORKFLOW_STAGE_IDS.NORMALIZATION,
    WORKFLOW_STAGE_IDS.ASSIGNMENT,
    WORKFLOW_STAGE_IDS.ROUTE_ANALYSIS,
    WORKFLOW_STAGE_IDS.EXCEPTION_DETECTION,
    WORKFLOW_STAGE_IDS.HUMAN_REVIEW,
    WORKFLOW_STAGE_IDS.DISPATCH,
  ],
  outputChannels: ['dashboard', 'driver_whatsapp', 'client_email', 'internal_alert'],
  entities: ['order', 'route', 'driver', 'incident'],
  defaults: {
    ingestionMode: 'multi_entity',
    reviewPolicy: 'human_on_exception',
  },
}

export const INMOBILIARIA_BASE_BUSINESS_TEMPLATE = {
  ...BASE_TEMPLATE,
  id: BUSINESS_TEMPLATE_IDS.INMOBILIARIA_BASE,
  vertical: 'inmobiliaria',
  label: 'Inmobiliaria · Operación base',
  description: 'Plantilla conceptual para leads, inmuebles, visitas, documentación y seguimiento comercial.',
  inputChannels: ['web_form', 'portal_import', 'whatsapp', 'email'],
  processingStages: [
    WORKFLOW_STAGE_IDS.LEAD_CAPTURE,
    WORKFLOW_STAGE_IDS.QUALIFICATION,
    WORKFLOW_STAGE_IDS.DOCUMENT_COLLECTION,
    WORKFLOW_STAGE_IDS.COORDINATION,
    WORKFLOW_STAGE_IDS.HUMAN_REVIEW,
    WORKFLOW_STAGE_IDS.FOLLOW_UP,
  ],
  outputChannels: ['dashboard', 'email', 'whatsapp', 'calendar_event'],
  entities: ['lead', 'property', 'visit', 'document'],
}

export const CONTABLE_BASE_BUSINESS_TEMPLATE = {
  ...BASE_TEMPLATE,
  id: BUSINESS_TEMPLATE_IDS.CONTABLE_BASE,
  vertical: 'contable',
  label: 'Estudio contable · Operación base',
  description: 'Plantilla conceptual para recepción documental, conciliación, revisión y entrega administrativa.',
  inputChannels: ['web_upload', 'email', 'drive_sync'],
  processingStages: [
    WORKFLOW_STAGE_IDS.DOCUMENT_INGESTION,
    WORKFLOW_STAGE_IDS.DOCUMENT_CLASSIFICATION,
    WORKFLOW_STAGE_IDS.FIELD_EXTRACTION,
    WORKFLOW_STAGE_IDS.RECONCILIATION,
    WORKFLOW_STAGE_IDS.HUMAN_REVIEW,
    WORKFLOW_STAGE_IDS.DELIVERY,
  ],
  outputChannels: ['dashboard', 'email', 'shared_drive'],
  entities: ['client_folder', 'document', 'ledger_item', 'delivery'],
}

export const BUSINESS_TEMPLATES = {
  [BUSINESS_TEMPLATE_IDS.GESTORIA_DGT]: GESTORIA_DGT_BUSINESS_TEMPLATE,
  [BUSINESS_TEMPLATE_IDS.LOGISTICA_BASE]: LOGISTICA_BASE_BUSINESS_TEMPLATE,
  [BUSINESS_TEMPLATE_IDS.INMOBILIARIA_BASE]: INMOBILIARIA_BASE_BUSINESS_TEMPLATE,
  [BUSINESS_TEMPLATE_IDS.CONTABLE_BASE]: CONTABLE_BASE_BUSINESS_TEMPLATE,
}

export function resolveBusinessTemplateId(caseData = {}) {
  return caseData.business_template || caseData.requirement_template || caseData.workflow_template || BUSINESS_TEMPLATE_IDS.GESTORIA_DGT
}

export function getBusinessTemplate(caseData = {}) {
  return BUSINESS_TEMPLATES[resolveBusinessTemplateId(caseData)] || GESTORIA_DGT_BUSINESS_TEMPLATE
}
