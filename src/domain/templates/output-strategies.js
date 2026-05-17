import { BUSINESS_TEMPLATE_IDS } from './business-templates.js'

export const OUTPUT_MODES = {
  CSV_BATCH: 'csv_batch',
  COPILOT_GUIDED: 'copilot_guided',
  MESSAGE_BODY: 'message_body',
  ATTACHMENT_PACKAGE: 'attachment_package',
  RPA_PAYLOAD: 'rpa_payload',
}

export const OUTPUT_CHANNELS = {
  DASHBOARD: 'dashboard',
  EMAIL: 'email',
  TELEGRAM: 'telegram',
  WHATSAPP: 'whatsapp',
  FILE_EXPORT: 'file_export',
}

export const OUTPUT_GROUPING = {
  NONE: 'none',
  BY_CASE_TYPE: 'by_case_type',
  BY_DESTINATION_SYSTEM: 'by_destination_system',
}

const BASE_OUTPUT_STRATEGY = {
  output_mode: OUTPUT_MODES.COPILOT_GUIDED,
  output_channel: OUTPUT_CHANNELS.DASHBOARD,
  destination_system: 'backoffice',
  grouping_strategy: OUTPUT_GROUPING.NONE,
  priority_rank: 999,
  allowed_case_statuses: ['ready_for_output'],
  requiresHumanCheckpoint: false,
}

const GESTORIA_DGT_OUTPUT_STRATEGIES = {
  transferencia: {
    output_mode: OUTPUT_MODES.CSV_BATCH,
    output_channel: OUTPUT_CHANNELS.FILE_EXPORT,
    destination_system: 'sage',
    grouping_strategy: OUTPUT_GROUPING.BY_CASE_TYPE,
    priority_rank: 1,
  },
  notificacion_venta: {
    output_mode: OUTPUT_MODES.CSV_BATCH,
    output_channel: OUTPUT_CHANNELS.FILE_EXPORT,
    destination_system: 'sage',
    grouping_strategy: OUTPUT_GROUPING.BY_CASE_TYPE,
    priority_rank: 1,
  },
  aceptacion_venta: {
    output_mode: OUTPUT_MODES.CSV_BATCH,
    output_channel: OUTPUT_CHANNELS.FILE_EXPORT,
    destination_system: 'sage',
    grouping_strategy: OUTPUT_GROUPING.BY_CASE_TYPE,
    priority_rank: 1,
  },
  duplicado: {
    output_mode: OUTPUT_MODES.COPILOT_GUIDED,
    output_channel: OUTPUT_CHANNELS.DASHBOARD,
    destination_system: 'portal_manual',
    grouping_strategy: OUTPUT_GROUPING.NONE,
    priority_rank: 2,
    requiresHumanCheckpoint: true,
  },
  cambio_domicilio: {
    output_mode: OUTPUT_MODES.COPILOT_GUIDED,
    output_channel: OUTPUT_CHANNELS.DASHBOARD,
    destination_system: 'portal_manual',
    grouping_strategy: OUTPUT_GROUPING.NONE,
    priority_rank: 2,
    requiresHumanCheckpoint: true,
  },
  baja_temporal: {
    output_mode: OUTPUT_MODES.COPILOT_GUIDED,
    output_channel: OUTPUT_CHANNELS.DASHBOARD,
    destination_system: 'portal_manual',
    grouping_strategy: OUTPUT_GROUPING.NONE,
    priority_rank: 2,
    requiresHumanCheckpoint: true,
  },
  baja_definitiva: {
    output_mode: OUTPUT_MODES.COPILOT_GUIDED,
    output_channel: OUTPUT_CHANNELS.DASHBOARD,
    destination_system: 'portal_manual',
    grouping_strategy: OUTPUT_GROUPING.NONE,
    priority_rank: 2,
    requiresHumanCheckpoint: true,
  },
  matriculacion: {
    output_mode: OUTPUT_MODES.COPILOT_GUIDED,
    output_channel: OUTPUT_CHANNELS.DASHBOARD,
    destination_system: 'portal_manual',
    grouping_strategy: OUTPUT_GROUPING.NONE,
    priority_rank: 2,
    requiresHumanCheckpoint: true,
  },
  matriculacion_importacion: {
    output_mode: OUTPUT_MODES.COPILOT_GUIDED,
    output_channel: OUTPUT_CHANNELS.DASHBOARD,
    destination_system: 'portal_manual',
    grouping_strategy: OUTPUT_GROUPING.NONE,
    priority_rank: 2,
    requiresHumanCheckpoint: true,
  },
}

export const OUTPUT_STRATEGIES = {
  [BUSINESS_TEMPLATE_IDS.GESTORIA_DGT]: GESTORIA_DGT_OUTPUT_STRATEGIES,
}

export function getOutputStrategy(caseData = {}) {
  const templateId =
    caseData.business_template || caseData.requirement_template || caseData.workflow_template || BUSINESS_TEMPLATE_IDS.GESTORIA_DGT

  const strategy = OUTPUT_STRATEGIES[templateId]?.[caseData.case_type] || null
  return { ...BASE_OUTPUT_STRATEGY, ...(strategy || {}) }
}
