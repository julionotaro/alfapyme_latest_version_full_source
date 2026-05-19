import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, LoaderCircle } from 'lucide-react'
import { CASE_STATUS_LABELS } from '../constants'

const REVIEW_STATUSES = ['human_validation', 'waiting_human', 'waiting_input', 'triaged']
const IN_PROGRESS_STATUSES = ['received', 'processing', 'delivering']
const READY_STATUSES = ['ready_for_output']
const BLOCKED_STATUSES = ['blocked', 'failed', 'pending_client']

export function HomeView({ cases = [], onSelectCase, onGoToTray }) {
  const pendingReview = cases.filter((item) => REVIEW_STATUSES.includes(item.status)).length
  const inProgress = cases.filter((item) => IN_PROGRESS_STATUSES.includes(item.status)).length
  const ready = cases.filter((item) => READY_STATUSES.includes(item.status)).length
  const blocked = cases.filter((item) => BLOCKED_STATUSES.includes(item.status)).length

  const rows = [...cases]
    .sort((a, b) => severityRank(a.status) - severityRank(b.status) || String(a.public_id).localeCompare(String(b.public_id)))
    .slice(0, 6)

  return (
    <div className="dashboard-view">
      <section className="dashboard-kpis">
        <KpiCard title="Por validar" value={pendingReview} note="Requieren tu atención" tone="danger" onClick={onGoToTray} />
        <KpiCard title="En proceso" value={inProgress} note="Tyrion está trabajando" tone="warning" onClick={onGoToTray} />
        <KpiCard title="Listos para salida" value={ready} note="Listos para ejecutar" tone="success" onClick={onGoToTray} />
        <KpiCard title="Bloqueados" value={blocked} note="Hay algo para destrabar" tone="neutral" onClick={onGoToTray} />
      </section>

      <section className="surface-card">
        <div className="section-head compact-head">
          <div>
            <h3>Expedientes recientes</h3>
            <p>Una tabla legible, como Dios y las oficinas agradecidas mandan.</p>
          </div>
        </div>

        <div className="table-shell">
          <div className="table-head dashboard-table-row">
            <span>Expediente</span>
            <span>Cliente</span>
            <span>Tipo trámite</span>
            <span>Estado actual</span>
            <span>Prioridad</span>
            <span>Acción</span>
          </div>

          {rows.length ? rows.map((item) => (
            <button key={item.id} className="dashboard-table-row data-row" onClick={() => onSelectCase(item)}>
              <span>
                <b>{item.public_id}</b>
                <small>{item.vehicle_plate || 'Sin matrícula confirmada'}</small>
              </span>
              <span>{item.client_name || 'Sin cliente'}</span>
              <span>{humanize(item.case_type)}</span>
              <span><StatusChip status={item.status} /></span>
              <span>{priorityLabel(item.status)}</span>
              <span className="linkish">{nextActionLabel(item.status)} <ArrowRight size={14} /></span>
            </button>
          )) : <p className="muted-line">Todavía no hay expedientes para mostrar.</p>}
        </div>
      </section>
    </div>
  )
}

function KpiCard({ title, value, note, tone, onClick }) {
  const Icon = tone === 'danger' ? AlertTriangle : tone === 'warning' ? LoaderCircle : tone === 'success' ? CheckCircle2 : Clock3
  return (
    <button className={`surface-card kpi-reference ${tone}`} onClick={onClick}>
      <div>
        <span className="kpi-title">{title}</span>
        <b>{value}</b>
        <small>{note}</small>
      </div>
      <div className="kpi-icon-wrap"><Icon size={18} /></div>
    </button>
  )
}

function StatusChip({ status }) {
  return <span className={`status-chip ${statusTone(status)}`}>{CASE_STATUS_LABELS[status] || status}</span>
}

function priorityLabel(status) {
  if (['blocked', 'failed'].includes(status)) return 'Alta'
  if (['human_validation', 'waiting_human', 'pending_client'].includes(status)) return 'Media'
  return 'Baja'
}

function nextActionLabel(status) {
  if (['blocked', 'failed'].includes(status)) return 'Revisar bloqueo'
  if (['human_validation', 'waiting_human'].includes(status)) return 'Validar lectura'
  if (status === 'pending_client') return 'Pedir faltante'
  if (status === 'ready_for_output') return 'Ejecutar salida'
  return 'Abrir expediente'
}

function severityRank(status) {
  if (['blocked', 'failed'].includes(status)) return 0
  if (['human_validation', 'waiting_human', 'pending_client'].includes(status)) return 1
  if (status === 'ready_for_output') return 2
  return 3
}

function humanize(value) {
  return String(value || 'sin clasificar').replace(/_/g, ' ')
}

function statusTone(status) {
  if (['blocked', 'failed'].includes(status)) return 'danger'
  if (['human_validation', 'waiting_human', 'pending_client', 'triaged'].includes(status)) return 'warning'
  if (['ready_for_output', 'completed'].includes(status)) return 'success'
  return 'neutral'
}
