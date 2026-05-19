import { RefreshCw } from 'lucide-react'
import { VIEW_TITLES } from '../constants'

export function Topbar({ view, onRefresh }) {
  return (
    <header>
      <div>
        <h2>{VIEW_TITLES[view] || view}</h2>
        <small>Consola de supervisión para revisar excepciones, no para encadenar clics sin sentido.</small>
      </div>
      <button onClick={onRefresh}>
        <RefreshCw size={16} />
        Refrescar
      </button>
    </header>
  )
}
