import { AlertTriangle, Eye } from 'lucide-react'
import { CASE_STATUS_LABELS } from '../constants'

const VALIDATION_STATUSES = ['human_validation', 'waiting_human', 'blocked', 'failed', 'pending_client']

export function ValidationView({ cases = [], selected, onSelectCase, onOpenTray, onOpenDocuments }) {
  const rows = cases.filter((item) => VALIDATION_STATUSES.includes(item.status))

  return (
    <section className="card validation-view">
      <div className="section-head">
        <div>
          <h3>Cola de validación IA</h3>
          <p>Aquí viven los casos que la IA no debería cerrar sola.</p>
        </div>
        <span className="status-pill warning">{rows.length} caso(s) con revisión</span>
      </div>

      {rows.length ? rows.map((item) => (
        <div key={item.id} className={`validation-row ${selected?.id === item.id ? 'sel' : ''}`}>
          <div>
            <b>{item.public_id}</b>
            <small>{item.client_name || 'Sin cliente'} · {humanizeCaseType(item.case_type)}</small>
          </div>
          <div>
            <span className={`status-pill ${resolveTone(item.status)}`}>{CASE_STATUS_LABELS[item.status] || item.status}</span>
          </div>
          <div>
            <small>{explainStatus(item.status)}</small>
          </div>
          <div className="validation-actions">
            <button onClick={() => onSelectCase(item)}><Eye size={14} /> Seleccionar</button>
            <button onClick={() => { onSelectCase(item); onOpenTray() }}>Abrir bandeja</button>
            <button onClick={() => { onSelectCase(item); onOpenDocuments() }}>Ver documentos</button>
          </div>
        </div>
      )) : (
        <div className="empty-state">
          <AlertTriangle size={18} />
          <p>No hay conflictos abiertos ahora mismo. Milagro estadístico o buen trabajo.</p>
        </div>
      )}
    </section>
  )
}

function humanizeCaseType(value) {
  return String(value || 'sin clasificar').replace(/_/g, ' ')
}

function resolveTone(status) {
  if (['blocked', 'failed'].includes(status)) return 'danger'
  return 'warning'
}

function explainStatus(status) {
  if (['blocked', 'failed'].includes(status)) return 'Conflicto crítico o fallo de flujo.'
  if (status === 'pending_client') return 'Faltan documentos o respuesta del cliente.'
  return 'Revisión humana antes de avanzar.'
}
