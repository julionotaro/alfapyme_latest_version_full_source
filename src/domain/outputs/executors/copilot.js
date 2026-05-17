export function buildCopilotSessions(queue = []) {
  const readyCases = queue.filter((item) => item.ready && item.output_mode === 'copilot_guided')
  const groups = new Map()

  for (const item of readyCases) {
    const key = `${item.case_type}::${item.destination_system}`
    const current = groups.get(key) || {
      id: `local-session:${key}`,
      session_name: `Copilot ${item.case_type}`,
      case_type: item.case_type,
      destination_system: item.destination_system,
      output_route: item.output_route,
      status: 'ready',
      total_cases: 0,
      rows: [],
    }

    current.rows.push({
      id: `local-session-case:${item.case_id}`,
      case_id: item.case_id,
      status: 'pending',
      prepared_fields: {
        expediente: item.public_id,
        cliente: item.client_name,
        matricula: item.vehicle_plate,
        tramite: item.case_type,
      },
      warnings: item.readiness_reasons || [],
      cases: item.cases,
    })
    current.total_cases += 1
    groups.set(key, current)
  }

  return [...groups.values()]
}
