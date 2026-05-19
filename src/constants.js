export const CASE_STATUS_LABELS = {
  received: 'Recibido',
  triaged: 'Triaje',
  processing: 'Procesando',
  pending_client: 'Pendiente cliente',
  waiting_input: 'Esperando input',
  waiting_human: 'Esperando humano',
  human_validation: 'En validación',
  ready_for_output: 'Listo salida',
  delivering: 'Entregando',
  completed: 'Completado',
  failed: 'Fallido',
  blocked: 'Bloqueado',
}

export const VIEWS = [
  { id: 'workspace', label: 'Supervisión' },
  { id: 'upload', label: 'Ingreso' },
  { id: 'output', label: 'Salidas' },
  { id: 'copilot', label: 'Copilot' },
  { id: 'history', label: 'Historial' },
]

export const VIEW_TITLES = {
  workspace: 'Supervisión operativa',
  upload: 'Ingreso documental',
  viewer: 'Visor documental',
  output: 'Mesa de salidas',
  copilot: 'Copilot de ejecución',
  history: 'Historial y auditoría',
}
