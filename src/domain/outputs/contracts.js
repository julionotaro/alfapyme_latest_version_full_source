import { OUTPUT_CHANNELS, OUTPUT_MODES } from '../templates/index.js'

const CSV_REQUIRED_FIELDS = ['public_id', 'client_name', 'case_type', 'status']
const MESSAGE_CHANNEL_FIELDS = {
  email: ['client_email'],
  telegram: ['telegram_chat_id'],
  whatsapp: ['whatsapp_number'],
}

function compact(values = []) {
  return values.filter(Boolean)
}

function normalizeString(value) {
  return String(value ?? '').trim()
}

export function getCsvMissingFields(caseData = {}) {
  return CSV_REQUIRED_FIELDS.filter((field) => !normalizeString(caseData[field]))
}

export function resolveMessagingChannel(caseData = {}, strategy = {}) {
  return caseData.preferred_contact_channel || caseData.output_channel || strategy.output_channel || OUTPUT_CHANNELS.EMAIL
}

export function getMessagingTarget(caseData = {}, channel) {
  if (channel === OUTPUT_CHANNELS.TELEGRAM) return normalizeString(caseData.telegram_chat_id)
  if (channel === OUTPUT_CHANNELS.WHATSAPP) return normalizeString(caseData.whatsapp_number)
  return normalizeString(caseData.client_email)
}

export function validateOutputPayload(caseData = {}, strategy = {}) {
  const reasons = []

  if (strategy.output_mode === OUTPUT_MODES.CSV_BATCH) {
    const missing = getCsvMissingFields(caseData)
    if (missing.length) reasons.push({ code: 'missing_csv_fields', detail: missing })
  }

  if ([OUTPUT_MODES.MESSAGE_BODY, OUTPUT_MODES.ATTACHMENT_PACKAGE].includes(strategy.output_mode)) {
    const channel = resolveMessagingChannel(caseData, strategy)
    const requiredFields = MESSAGE_CHANNEL_FIELDS[channel] || MESSAGE_CHANNEL_FIELDS.email
    const missing = requiredFields.filter((field) => !normalizeString(caseData[field]))
    if (missing.length) reasons.push({ code: 'missing_channel_target', detail: { channel, missing } })
  }

  if (strategy.requiresHumanCheckpoint && caseData.status !== 'ready_for_output') {
    reasons.push({ code: 'human_checkpoint_pending', detail: caseData.status || 'unknown' })
  }

  return {
    valid: reasons.length === 0,
    reasons,
  }
}

export function buildCsvPayloadRow(row = {}) {
  return {
    expediente: normalizeString(row.public_id),
    cliente: normalizeString(row.client_name),
    matricula: normalizeString(row.vehicle_plate),
    tramite: normalizeString(row.case_type),
    estado_caso: normalizeString(row.case_status || row.status),
    modo: normalizeString(row.output_mode),
    destino: normalizeString(row.destination_system),
    canal_salida: normalizeString(row.output_route),
    plantilla_negocio: normalizeString(row.business_template || row.requirement_template || row.workflow_template),
    payload_status: normalizeString(row.payloadStatus || 'ready'),
  }
}

export function buildMessagePayload(caseData = {}, strategy = {}) {
  const channel = resolveMessagingChannel(caseData, strategy)
  const target = getMessagingTarget(caseData, channel)
  const lines = compact([
    `Expediente: ${normalizeString(caseData.public_id)}`,
    `Cliente: ${normalizeString(caseData.client_name)}`,
    caseData.vehicle_plate ? `Matrícula: ${normalizeString(caseData.vehicle_plate)}` : null,
    `Trámite: ${normalizeString(caseData.case_type)}`,
    `Estado: ${normalizeString(caseData.status)}`,
  ])

  return {
    channel,
    target,
    subject: `Estado de ${normalizeString(caseData.public_id || caseData.id || 'expediente')}`,
    body: lines.join('\n'),
  }
}
