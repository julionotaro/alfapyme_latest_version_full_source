import { buildMessagePayload, validateOutputPayload } from '../contracts.js'

const DEFAULT_ROUTE_BY_CHANNEL = {
  email: 'email',
  telegram: 'telegram',
  whatsapp: 'whatsapp',
}

function resolveStrategy(caseData = {}) {
  return {
    output_mode: 'message_body',
    output_channel: caseData.preferred_contact_channel || caseData.output_channel || 'email',
  }
}

export function buildMessagingJobs(cases = []) {
  return cases.flatMap((item) => {
    const strategy = resolveStrategy(item)
    const payload = buildMessagePayload(item, strategy)
    const validation = validateOutputPayload(item, strategy)
    const route = DEFAULT_ROUTE_BY_CHANNEL[payload.channel] || 'email'
    const baseJob = {
      case_id: item.id,
      output_route: route,
      destination_system: payload.channel,
      attempts: 0,
      max_attempts: 3,
      payload,
      payload_status: validation.valid ? 'ready' : 'blocked',
      payload_issues: validation.reasons,
    }

    return [
      {
        id: `local-msg-status:${item.id}`,
        ...baseJob,
        output_mode: 'message_body',
        status: validation.valid ? 'draft' : 'blocked',
        subject: payload.subject,
        preview: payload.body,
      },
      {
        id: `local-msg-attachment:${item.id}`,
        ...baseJob,
        output_mode: 'attachment_package',
        status: validation.valid ? 'draft' : 'blocked',
        subject: `Documentación de ${item.public_id}`,
        preview: `Adjuntar documentación o resumen operativo para ${item.public_id}.`,
      },
    ]
  })
}
