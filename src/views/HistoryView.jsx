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
    <section className="card">
      <h3>Historial operativo {selected?.public_id}</h3>
      {rows.length ? (
        rows.map((row) => (
          <div className="hist" key={row.id}>
            <b>{row.action}</b>
            <span>{new Date(row.created_at).toLocaleString()}</span>
            <small>{JSON.stringify(row.metadata || {})}</small>
          </div>
        ))
      ) : (
        <p>Sin eventos todavía.</p>
      )}
    </section>
  )
}
