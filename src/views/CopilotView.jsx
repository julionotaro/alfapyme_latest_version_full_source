import { useEffect, useState } from 'react'
import { CheckCircle2, Flag, SkipForward } from 'lucide-react'
import { fetchOutputSessions, fetchSessionCases, updateSessionCase } from '../services/core'

export function CopilotView() {
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [cases, setCases] = useState([])
  const [index, setIndex] = useState(0)
  const [message, setMessage] = useState('')

  async function loadSessions() {
    const rows = await fetchOutputSessions()
    setSessions(rows)
    if (!activeSession && rows[0]) {
      setActiveSession(rows[0])
    }
  }

  async function loadCases(sessionId) {
    const rows = await fetchSessionCases(sessionId)
    setCases(rows)
    setIndex(0)
  }

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (activeSession) {
      loadCases(activeSession.id)
    }
  }, [activeSession?.id])

  const currentCase = cases[index]

  async function setStatus(status) {
    if (!currentCase) return

    await updateSessionCase(currentCase.id, {
      status,
      completed_at: new Date().toISOString(),
    })

    await loadCases(activeSession.id)
    setMessage(`Caso marcado: ${status}`)
  }

  return (
    <div className="copilot">
      <section className="doclist">
        <h3>Sesiones</h3>
        {sessions.map((session) => (
          <button
            key={session.id}
            className={activeSession?.id === session.id ? 'on' : ''}
            onClick={() => setActiveSession(session)}
          >
            {session.session_name}
            <small>
              {session.total_cases} casos · {session.status}
            </small>
          </button>
        ))}
      </section>

      <section className="card cockpit">
        <h3>Copilot Cockpit</h3>
        {message && <div className="msg">{message}</div>}

        {currentCase ? (
          <>
            <p>
              <b>{currentCase.cases?.public_id}</b> · {currentCase.cases?.client_name}
            </p>
            <p>Matrícula: {currentCase.cases?.vehicle_plate}</p>
            <p>Estado sesión: {currentCase.status}</p>

            <div className="bar">
              <button className="primary" onClick={() => setStatus('completed')}>
                <CheckCircle2 size={14} /> Presentado
              </button>
              <button onClick={() => setStatus('failed')}>
                <Flag size={14} /> Error
              </button>
              <button onClick={() => setStatus('skipped')}>
                <SkipForward size={14} /> Saltar
              </button>
              <button onClick={() => setIndex(Math.min(index + 1, cases.length - 1))}>Siguiente</button>
            </div>
          </>
        ) : (
          <p>No hay casos en esta sesión.</p>
        )}
      </section>

      <section className="panel">
        <h3>Progreso</h3>
        {cases.map((sessionCase, caseIndex) => (
          <p key={sessionCase.id} className={caseIndex === index ? 'selp' : ''}>
            {sessionCase.cases?.public_id} · {sessionCase.status}
          </p>
        ))}
      </section>
    </div>
  )
}
