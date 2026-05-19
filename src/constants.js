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
  { id: 'home', label: 'Inicio' },
  { id: 'workspace', label: 'Bandeja operativa' },
  { id: 'upload', label: 'Documentos / Entrada' },
  { id: 'validation', label: 'Validación IA' },
  { id: 'output', label: 'Salidas' },
  { id: 'history', label: 'Historial' },
  { id: 'settings', label: 'Configuración' },
]

export const VIEW_TITLES = {
  home: 'Inicio',
  workspace: 'Bandeja operativa',
  upload: 'Documentos / Entrada',
  validation: 'Validación IA',
  viewer: 'Visor documental',
  output: 'Salidas',
  history: 'Historial y auditoría',
  settings: 'Configuración',
}
