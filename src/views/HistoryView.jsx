import { useEffect, useState } from 'react'
import { fetchCaseHistory } from '../services/core'

export function HistoryView({ selected }) {
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (selected) {
      fetchCaseHistory(selected.id).then(setRows)
    }
  }, [selected?.id])

  return (
    <section className="surface-card history-reference-view">
      <div className="section-head compact-head history-top">
        <div>
          <h3>Historial operativo · trazabilidad</h3>
          <p>Consulta el estado y recorrido del expediente sin tener que leer jeroglíficos internos.</p>
        </div>
        <div className="history-search-placeholder">Buscar por documento, cliente o trámite…</div>
      </div>

      <div className="history-filters">
        <span>Rango actual</span>
        <span>Cliente: {selected?.client_name || 'sin seleccionar'}</span>
        <span>Trámite: {selected?.case_type ? humanize(selected.case_type) : 'todos'}</span>
        <span>Estado: todos</span>
      </div>

      <div className="history-table">
        <div className="history-head">
          <span>Documento</span>
          <span>Evento</span>
          <span>Detalle</span>
          <span>Fecha</span>
        </div>

        {rows.length ? rows.map((row) => (
          <div key={row.id} className="history-data-row">
            <span>
              <b>{selected?.public_id || 'Expediente'}</b>
              <small>{selected?.client_name || 'Sin cliente'}</small>
            </span>
            <span>{humanize(row.action)}</span>
            <span className="history-metadata">{summarizeMetadata(row.metadata)}</span>
            <span>{new Date(row.created_at).toLocaleString()}</span>
          </div>
        )) : <p className="muted-line">Sin eventos todavía para este expediente.</p>}
      </div>
    </section>
  )
}

function summarizeMetadata(metadata) {
  if (!metadata || !Object.keys(metadata).length) return 'Sin detalle adicional'
  return Object.entries(metadata).slice(0, 3).map(([key, value]) => `${key}: ${String(value)}`).join(' · ')
}

function humanize(value) {
  return String(value || '').replace(/_/g, ' ')
}
