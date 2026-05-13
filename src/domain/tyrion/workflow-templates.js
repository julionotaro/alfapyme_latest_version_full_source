const DEFAULT_WORKFLOW_TEMPLATE = {
  id: 'default_document_intake',
  label: 'Plantilla base documental',
  stateMap: {
    pending_documents: {
      caseStatus: 'pending_client',
      label: 'Pendiente cliente',
      resolutionHint: 'Solicitar documentación pendiente al cliente antes de continuar.',
    },
    human_validation: {
      caseStatus: 'human_validation',
      label: 'En validación humana',
      resolutionHint: 'Derivar expediente a revisión humana controlada.',
    },
    ready_for_output: {
      caseStatus: 'ready_for_output',
      label: 'Listo para salida',
      resolutionHint: 'Permitir preparación de salida si no hay controles externos pendientes.',
    },
  },
}

const WORKFLOW_TEMPLATES = {
  gestoria_dgt: {
    ...DEFAULT_WORKFLOW_TEMPLATE,
    id: 'gestoria_dgt',
    label: 'Gestoría DGT',
  },
}

function resolveTemplateKey(caseData) {
  return caseData?.workflow_template || caseData?.business_line || 'gestoria_dgt'
}

export function resolveWorkflowTransition({ caseData, assessment }) {
  if (!assessment?.decision?.targetState) return null

  const template = WORKFLOW_TEMPLATES[resolveTemplateKey(caseData)] || DEFAULT_WORKFLOW_TEMPLATE
  const templateState = template.stateMap[assessment.decision.targetState]

  if (!templateState) return null

  const currentStatus = caseData?.status || null
  const nextStatus = templateState.caseStatus

  return {
    templateId: template.id,
    templateLabel: template.label,
    currentStatus,
    nextStatus,
    targetState: assessment.decision.targetState,
    shouldApply: currentStatus !== nextStatus,
    resolutionHint: templateState.resolutionHint,
  }
}

export { DEFAULT_WORKFLOW_TEMPLATE, WORKFLOW_TEMPLATES }
