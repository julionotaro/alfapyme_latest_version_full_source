import { Bell, Bot, RefreshCw } from 'lucide-react'
import { VIEW_TITLES } from '../constants'

export function Topbar({ view, onRefresh }) {
  return (
    <header className="topbar-shell">
      <div>
        <span className="page-kicker">{VIEW_TITLES[view] || view}</span>
        <h2>Buenos días, Julio</h2>
        <small>Aquí tienes el pulso de tu flujo documental y las excepciones que merecen atención real.</small>
      </div>

      <div className="topbar-actions">
        <div className="assistant-pill">
          <div className="assistant-icon"><Bot size={16} /></div>
          <div>
            <b>Tyrion</b>
            <small>Asistente IA</small>
          </div>
        </div>
        <button className="icon-btn" onClick={onRefresh}>
          <RefreshCw size={16} />
        </button>
        <button className="icon-btn">
          <Bell size={16} />
        </button>
      </div>
    </header>
  )
}
