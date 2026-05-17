import { BUSINESS_TEMPLATE_IDS } from './business-templates.js'

export const CASE_BLUEPRINTS = {
  [BUSINESS_TEMPLATE_IDS.GESTORIA_DGT]: {
    primaryEntity: 'case',
    secondaryEntities: ['document', 'checklist_item', 'output_job'],
    inputContracts: ['document_upload', 'operator_review'],
    outputContracts: ['dashboard_queue', 'csv_export', 'client_notification'],
  },
  [BUSINESS_TEMPLATE_IDS.LOGISTICA_BASE]: {
    primaryEntity: 'order',
    secondaryEntities: ['route', 'driver', 'incident'],
    inputContracts: ['order_import', 'driver_status', 'customer_message'],
    outputContracts: ['dispatch_order', 'driver_message', 'customer_update'],
  },
  [BUSINESS_TEMPLATE_IDS.INMOBILIARIA_BASE]: {
    primaryEntity: 'lead',
    secondaryEntities: ['property', 'visit', 'document'],
    inputContracts: ['lead_capture', 'portal_import', 'client_message'],
    outputContracts: ['followup_message', 'visit_schedule', 'document_request'],
  },
  [BUSINESS_TEMPLATE_IDS.CONTABLE_BASE]: {
    primaryEntity: 'client_folder',
    secondaryEntities: ['document', 'ledger_item', 'delivery'],
    inputContracts: ['document_upload', 'mailbox_sync'],
    outputContracts: ['delivery_notice', 'shared_folder_export'],
  },
}

export function getCaseBlueprint(templateId) {
  return CASE_BLUEPRINTS[templateId] || null
}
