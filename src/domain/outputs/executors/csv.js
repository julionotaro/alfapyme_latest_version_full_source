import { buildCsvPayloadRow, validateOutputPayload } from '../contracts.js'

function csvEscape(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

export function buildCsvBatchGroups(queue = []) {
  const readyCsvCases = queue.filter((item) => item.ready && item.output_mode === 'csv_batch')
  const groups = new Map()

  for (const item of readyCsvCases) {
    const key = `${item.case_type}::${item.destination_system}`
    const current = groups.get(key) || {
      id: `local-batch:${key}`,
      case_type: item.case_type,
      destination_system: item.destination_system,
      output_mode: item.output_mode,
      output_route: item.output_route,
      grouping_strategy: item.grouping_strategy,
      status: 'ready',
      total_cases: 0,
      file_name: `${item.case_type || 'export'}_${item.destination_system || 'batch'}.csv`,
      rows: [],
      payload_issues: [],
    }

    const payloadValidation = validateOutputPayload(item.cases || item, item.strategy || {})
    current.rows.push({ ...item, payloadValidation })
    current.total_cases += 1
    current.payload_issues.push(...payloadValidation.reasons)
    groups.set(key, current)
  }

  return [...groups.values()].map((group) => ({
    ...group,
    payload_status: group.payload_issues.length ? 'warning' : 'ready',
  }))
}

export function buildCsvContent(rows = []) {
  const headers = ['expediente', 'cliente', 'matricula', 'tramite', 'estado_caso', 'modo', 'destino', 'canal_salida', 'plantilla_negocio', 'payload_status']
  const lines = [
    headers,
    ...rows.map((row) => Object.values(buildCsvPayloadRow(row))),
  ]

  return lines.map((line) => line.map(csvEscape).join(';')).join('\n')
}
