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
  { id: 'workspace', label: 'Workspace' },
  { id: 'upload', label: 'Carga documental' },
  { id: 'viewer', label: 'Visor' },
  { id: 'output', label: 'Salidas' },
  { id: 'copilot', label: 'Copilot' },
  { id: 'history', label: 'Historial' },
]
