import { evaluateExpedient } from '../tyrion/index.js'
import { getCaseBlueprint, getOutputStrategy } from '../templates/index.js'
import { evaluateOutputReadiness } from './readiness.js'

function buildQueueStatus(readiness) {
  if (readiness.ready) return 'ready'
  if (readiness.reasons.some((reason) => reason.code === 'human_validation_pending')) return 'waiting_human'
  if (readiness.reasons.some((reason) => reason.code === 'status_not_allowed')) return 'waiting_state'
  if (readiness.reasons.some((reason) => reason.code === 'missing_channel_target')) return 'waiting_channel'
  return 'blocked'
}

export function planCaseOutput({ caseData, checklist = [], documents = [] }) {
  const assessment = evaluateExpedient({ caseData, documents })
  const readiness = evaluateOutputReadiness(
    {
      ...caseData,
      failedCrossValidations: assessment.failedCrossValidations,
    },
    { checklist },
  )
  const strategy = readiness.strategy || getOutputStrategy(caseData)
  const blueprint = getCaseBlueprint(caseData.business_template || caseData.requirement_template || caseData.workflow_template)

  return {
    id: `plan:${caseData.id}`,
    case_id: caseData.id,
    case_type: caseData.case_type,
    case_status: caseData.status,
    public_id: caseData.public_id,
    client_name: caseData.client_name,
    vehicle_plate: caseData.vehicle_plate,
    output_route: strategy.output_channel,
    output_mode: strategy.output_mode,
    destination_system: strategy.destination_system,
    grouping_strategy: strategy.grouping_strategy,
    priority_rank: strategy.priority_rank,
    status: buildQueueStatus(readiness),
    ready: readiness.ready,
    readiness_reasons: readiness.reasons,
    payload_status: readiness.payloadValidation?.valid ? 'ready' : 'blocked',
    payload_issues: readiness.payloadValidation?.reasons || [],
    blueprint,
    strategy,
    cases: caseData,
  }
}

export function planOutputs({ cases = [], checklistsByCase = {}, documentsByCase = {} }) {
  return cases
    .map((caseData) =>
      planCaseOutput({
        caseData,
        checklist: checklistsByCase[caseData.id] || [],
        documents: documentsByCase[caseData.id] || [],
      }),
    )
    .sort((a, b) => {
      if (a.priority_rank !== b.priority_rank) return a.priority_rank - b.priority_rank
      return String(a.public_id || '').localeCompare(String(b.public_id || ''))
    })
}
