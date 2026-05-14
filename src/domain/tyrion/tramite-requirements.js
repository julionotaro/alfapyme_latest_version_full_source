import { getRequirementForCase } from './requirement-templates.js'

export const TYRION_CASE_STATES = {
  RECEIVED: 'received',
  CLASSIFYING: 'classifying',
  EXTRACTING: 'extracting',
  PENDING_DOCUMENTS: 'pending_documents',
  HUMAN_VALIDATION: 'human_validation',
  BLOCKED: 'blocked',
  READY_FOR_OUTPUT: 'ready_for_output',
  PROCESSING_OUTPUT: 'processing_output',
  COMPLETED: 'completed',
  FAILED: 'failed',
}

export function getTramiteRequirement(caseType, caseData = {}) {
  return getRequirementForCase({ ...caseData, case_type: caseType })
}
