import { AlertTriangle, CheckCircle2, Clock3, FileWarning } from 'lucide-react'
import { CASE_STATUS_LABELS } from '../constants'

const REVIEW_STATUSES = ['human_validation', 'waiting_human', 'waiting_input', 'triaged']
const IN_PROGRESS_STATUSES = ['received', 'processing', 'delivering']
const BLOCKED_STATUSES = ['blocked', 'failed', 'pending_client']
const READY_STATUSES = ['ready_for_output']

export function HomeView({ cases = [], onSelectCase, onGoToTray }) {
  const pendingReview = cases.filter((item) => REVIEW_STATUSES.includes(item.status)).length
  const inProgress = cases.filter((item) => IN_PROGRESS_STATUSES.includes(item.status)).length
  const blocked = cases.filter((item) => BLOCKED_STATUSES.includes(item.status)).length
  const ready = cases.filter((item) => READY_STATUSES.includes(item.status)).length

  const highlightedCases = [...cases]
    .sort((a, b) => severityRank(a.status) - severityRank(b.status) || String(a.public_id).localeCompare(String(b.public_id)))
    .slice(0, 8)

  const exceptionCards = [
    {
      title: 'Bloqueos reales',
      value: cases.filter((item) => ['blocked', 'failed'].includes(item.status)).length,
      note: 'Casos que no deberían avanzar sin intervención.',
      tone: 'danger',
      icon: AlertTriangle,
    },
    {
      title: 'Revisión humana',
      value: cases.filter((item) => ['human_validation', 'waiting_human'].includes(item.status)).length,
      note: 'Expedientes que la IA dejó listos para supervisión.',
      tone: 'warning',
      icon: FileWarning,
    },
    {
      title: 'Pendiente cliente',
      value: cases.filter((item) => item.status === 'pending_client').length,
      note: 'Faltan documentos o respuesta externa.',
      tone: 'neutral',
      icon: Clock3,
    },
    {
      title: 'Listos para salida',
      value: ready,
      note: 'Ya pueden pasar a ejecución.',
      tone: 'success',
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="home-view">
      <section className="home-hero card">
        <div>
          <h3>Resumen del día</h3>
          <p>La home quedó para supervisar excepciones, no para decorar la pantalla con fuegos artificiales.</p>
        </div>
        <button className="primary" onClick={onGoToTray}>Abrir bandeja operativa</button>
      </section>

      <section className="home-kpis">
        <KpiCard label="Pendientes de revisión" value={pendingReview} tone="warning" />
        <KpiCard label="En curso" value={inProgress} tone="neutral" />
        <KpiCard label="Bloqueados" value={blocked} tone="danger" />
        <KpiCard label="Listos para salida" value={ready} tone="success" />
      </section>

      <section className="home-main-grid">
        <div className="card">
          <div className="section-head">
            <div>
              <h3>Expedientes prioritarios</h3>
              <p>Primero lo que está bloqueado, luego lo que exige decisión humana.</p>
            </div>
          </div>

          <div className="home-table">
            <div className="home-row head">
              <span>Expediente</span>
              <span>Cliente</span>
              <span>Trámite</span>
              <span>Estado</span>
              <span>Siguiente acción</span>
            </div>
            {highlightedCases.length ? highlightedCases.map((item) => (
              <button
                key={item.id}
                className="home-row"
                onClick={() => onSelectCase(item)}
              >
                <span><b>{item.public_id}</b></span>
                <span>{item.client_name || 'Sin cliente'}</span>
                <span>{humanizeCaseType(item.case_type)}</span>
                <span>{CASE_STATUS_LABELS[item.status] || item.status}</span>
                <span>{nextActionLabel(item.status)}</span>
              </button>
            )) : <p className="muted-line">Todavía no hay expedientes para resumir.</p>}
          </div>
        </div>

        <div className="exception-stack">
          {exceptionCards.map(({ title, value, note, tone, icon: Icon }) => (
            <div key={title} className={`card exception-card ${tone}`}>
              <div className="exception-head">
                <Icon size={18} />
                <b>{title}</b>
              </div>
              <div className="exception-value">{value}</div>
              <p>{note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function KpiCard({ label, value, tone }) {
  return (
    <div className={`card kpi-card ${tone}`}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  )
}

function humanizeCaseType(value) {
  return String(value || 'sin clasificar').replace(/_/g, ' ')
}

function severityRank(status) {
  if (['blocked', 'failed'].includes(status)) return 0
  if (['human_validation', 'waiting_human', 'pending_client'].includes(status)) return 1
  if (status === 'ready_for_output') return 2
  return 3
}

function nextActionLabel(status) {
  if (['blocked', 'failed'].includes(status)) return 'Revisar bloqueo'
  if (['human_validation', 'waiting_human'].includes(status)) return 'Validar decisión'
  if (status === 'pending_client') return 'Pedir faltantes'
  if (status === 'ready_for_output') return 'Ejecutar salida'
  return 'Seguir seguimiento'
}
