import { getOutputStrategy, OUTPUT_MODES } from '../templates/index.js'
import { validateOutputPayload } from './contracts.js'

function normalizeChecklist(checklist = []) {
  return checklist.map((item) => ({
    ...item,
    is_blocking: Boolean(item.is_blocking),
  }))
}

function getBlockingChecklistIssues(checklist = []) {
  return normalizeChecklist(checklist).filter((item) => {
    if (!item.is_blocking) return false

    return ['missing', 'needs_review', 'rejected'].includes(item.validation_status) || item.status === 'missing'
  })
}

function getFailedCrossValidations(caseData = {}) {
  return (caseData.failedCrossValidations || caseData.failed_cross_validations || []).filter(
    (item) => item?.status === 'failed' || item?.severity === 'blocking',
  )
}

export function evaluateOutputReadiness(caseData = {}, context = {}) {
  const strategy = getOutputStrategy(caseData)
  const checklist = context.checklist || []
  const blockingChecklistIssues = getBlockingChecklistIssues(checklist)
  const failedCrossValidations = getFailedCrossValidations(caseData)
  const payloadValidation = validateOutputPayload(caseData, strategy)
  const reasons = []

  if (!strategy.allowed_case_statuses.includes(caseData.status)) {
    reasons.push({ code: 'status_not_allowed', detail: caseData.status || 'unknown' })
  }

  if (blockingChecklistIssues.length > 0) {
    reasons.push({ code: 'blocking_checklist', detail: blockingChecklistIssues.map((item) => item.document_label) })
  }

  if (failedCrossValidations.length > 0) {
    reasons.push({ code: 'cross_validation_failed', detail: failedCrossValidations.map((item) => item.label || item.rule) })
  }

  if (strategy.output_mode === OUTPUT_MODES.COPILOT_GUIDED && caseData.status === 'human_validation') {
    reasons.push({ code: 'human_validation_pending', detail: 'case_still_in_human_validation' })
  }

  reasons.push(...payloadValidation.reasons)

  return {
    ready: reasons.length === 0,
    strategy,
    reasons,
    payloadValidation,
  }
}
