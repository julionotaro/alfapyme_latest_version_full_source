import { Bot, Cog, FileSearch, FolderOpen, GitBranch, History, Home, Inbox } from 'lucide-react'
import { VIEWS } from '../constants'

const ICONS = {
  home: Home,
  workspace: Inbox,
  upload: FolderOpen,
  validation: FileSearch,
  output: GitBranch,
  history: History,
  settings: Cog,
}

export function Sidebar({ view, onChange }) {
  return (
    <aside className="sidebar-shell">
      <div className="brand-card">
        <div className="brand-mark">A</div>
        <div>
          <h1>Alfa‑Pyme</h1>
          <p>Ops Cockpit · v0.8.1</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {VIEWS.map(({ id, label }) => {
          const Icon = ICONS[id] || Home
          return (
            <button key={id} className={view === id ? 'on' : ''} onClick={() => onChange(id)}>
              <Icon size={16} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-assistant-card">
        <div className="assistant-badge">
          <Bot size={16} />
        </div>
        <div>
          <b>Tyrion</b>
          <small>Asistente IA para supervisión documental</small>
        </div>
      </div>
    </aside>
  )
}
