import { RefreshCw } from 'lucide-react'

export function Topbar({ view, onRefresh }) {
  return (
    <header>
      <h2>{view}</h2>
      <button onClick={onRefresh}>
        <RefreshCw size={16} />
        Refrescar
      </button>
    </header>
  )
}
