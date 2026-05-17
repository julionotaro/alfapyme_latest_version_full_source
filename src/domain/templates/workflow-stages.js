export const WORKFLOW_STAGE_IDS = {
  DOCUMENT_INGESTION: 'document_ingestion',
  DOCUMENT_CLASSIFICATION: 'document_classification',
  FIELD_EXTRACTION: 'field_extraction',
  EXPEDIENT_VALIDATION: 'expedient_validation',
  HUMAN_REVIEW: 'human_review',
  OUTPUT_PREPARATION: 'output_preparation',
  NORMALIZATION: 'normalization',
  ASSIGNMENT: 'assignment',
  ROUTE_ANALYSIS: 'route_analysis',
  EXCEPTION_DETECTION: 'exception_detection',
  DISPATCH: 'dispatch',
  LEAD_CAPTURE: 'lead_capture',
  QUALIFICATION: 'qualification',
  DOCUMENT_COLLECTION: 'document_collection',
  COORDINATION: 'coordination',
  FOLLOW_UP: 'follow_up',
  RECONCILIATION: 'reconciliation',
  DELIVERY: 'delivery',
}

export const WORKFLOW_STAGES = {
  [WORKFLOW_STAGE_IDS.DOCUMENT_INGESTION]: {
    id: WORKFLOW_STAGE_IDS.DOCUMENT_INGESTION,
    layer: 'input_processing',
    label: 'Ingesta documental',
    reusable: true,
  },
  [WORKFLOW_STAGE_IDS.DOCUMENT_CLASSIFICATION]: {
    id: WORKFLOW_STAGE_IDS.DOCUMENT_CLASSIFICATION,
    layer: 'processing',
    label: 'Clasificación documental',
    reusable: true,
  },
  [WORKFLOW_STAGE_IDS.FIELD_EXTRACTION]: {
    id: WORKFLOW_STAGE_IDS.FIELD_EXTRACTION,
    layer: 'processing',
    label: 'Extracción de campos',
    reusable: true,
  },
  [WORKFLOW_STAGE_IDS.EXPEDIENT_VALIDATION]: {
    id: WORKFLOW_STAGE_IDS.EXPEDIENT_VALIDATION,
    layer: 'processing',
    label: 'Validación del expediente',
    reusable: true,
  },
  [WORKFLOW_STAGE_IDS.HUMAN_REVIEW]: {
    id: WORKFLOW_STAGE_IDS.HUMAN_REVIEW,
    layer: 'processing',
    label: 'Revisión humana',
    reusable: true,
  },
  [WORKFLOW_STAGE_IDS.OUTPUT_PREPARATION]: {
    id: WORKFLOW_STAGE_IDS.OUTPUT_PREPARATION,
    layer: 'output',
    label: 'Preparación de salida',
    reusable: true,
  },
  [WORKFLOW_STAGE_IDS.NORMALIZATION]: {
    id: WORKFLOW_STAGE_IDS.NORMALIZATION,
    layer: 'processing',
    label: 'Normalización de entradas',
    reusable: true,
  },
  [WORKFLOW_STAGE_IDS.ASSIGNMENT]: {
    id: WORKFLOW_STAGE_IDS.ASSIGNMENT,
    layer: 'processing',
    label: 'Asignación',
    reusable: true,
  },
  [WORKFLOW_STAGE_IDS.ROUTE_ANALYSIS]: {
    id: WORKFLOW_STAGE_IDS.ROUTE_ANALYSIS,
    layer: 'processing',
    label: 'Análisis de rutas',
    reusable: false,
  },
  [WORKFLOW_STAGE_IDS.EXCEPTION_DETECTION]: {
    id: WORKFLOW_STAGE_IDS.EXCEPTION_DETECTION,
    layer: 'processing',
    label: 'Detección de incidencias',
    reusable: true,
  },
  [WORKFLOW_STAGE_IDS.DISPATCH]: {
    id: WORKFLOW_STAGE_IDS.DISPATCH,
    layer: 'output',
    label: 'Despacho / comunicación',
    reusable: false,
  },
  [WORKFLOW_STAGE_IDS.LEAD_CAPTURE]: {
    id: WORKFLOW_STAGE_IDS.LEAD_CAPTURE,
    layer: 'input_processing',
    label: 'Captura de leads',
    reusable: false,
  },
  [WORKFLOW_STAGE_IDS.QUALIFICATION]: {
    id: WORKFLOW_STAGE_IDS.QUALIFICATION,
    layer: 'processing',
    label: 'Cualificación',
    reusable: false,
  },
  [WORKFLOW_STAGE_IDS.DOCUMENT_COLLECTION]: {
    id: WORKFLOW_STAGE_IDS.DOCUMENT_COLLECTION,
    layer: 'processing',
    label: 'Recogida documental',
    reusable: false,
  },
  [WORKFLOW_STAGE_IDS.COORDINATION]: {
    id: WORKFLOW_STAGE_IDS.COORDINATION,
    layer: 'processing',
    label: 'Coordinación operativa',
    reusable: false,
  },
  [WORKFLOW_STAGE_IDS.FOLLOW_UP]: {
    id: WORKFLOW_STAGE_IDS.FOLLOW_UP,
    layer: 'output',
    label: 'Seguimiento',
    reusable: false,
  },
  [WORKFLOW_STAGE_IDS.RECONCILIATION]: {
    id: WORKFLOW_STAGE_IDS.RECONCILIATION,
    layer: 'processing',
    label: 'Conciliación',
    reusable: false,
  },
  [WORKFLOW_STAGE_IDS.DELIVERY]: {
    id: WORKFLOW_STAGE_IDS.DELIVERY,
    layer: 'output',
    label: 'Entrega',
    reusable: false,
  },
}

export function getWorkflowStage(stageId) {
  return WORKFLOW_STAGES[stageId] || null
}
