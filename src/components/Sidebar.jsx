import { VIEWS } from '../constants'

export function Sidebar({ view, onChange }) {
  return (
    <aside>
      <h1>Alfa‑Pyme</h1>
      <p>Ops Cockpit — v0.7.0</p>

      {VIEWS.map(({ id, label }) => (
        <button
          key={id}
          className={view === id ? 'on' : ''}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}

      <div className="sidebar-footer">
        <small>Prioridad: bloqueos → revisión → salida.</small>
      </div>
    </aside>
  )
}
