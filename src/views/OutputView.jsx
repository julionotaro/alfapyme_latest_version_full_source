import { useEffect, useState } from 'react'
import { Download, PlayCircle, RotateCcw } from 'lucide-react'
import {
  downloadBatchCsv,
  fetchOutputBatches,
  fetchOutputJobs,
  fetchOutputQueue,
  fetchOutputSessions,
  fetchOutputStrategies,
  processOutputQueue,
  retryFailedJobs,
  updateOutputJob,
} from '../services/core'
import { List } from '../components/List'

export function OutputView() {
  const [tab, setTab] = useState('queue')
  const [queue, setQueue] = useState([])
  const [batches, setBatches] = useState([])
  const [sessions, setSessions] = useState([])
  const [jobs, setJobs] = useState([])
  const [strategies, setStrategies] = useState([])
  const [message, setMessage] = useState('')

  async function load() {
    setQueue(await fetchOutputQueue())
    setBatches(await fetchOutputBatches())
    setSessions(await fetchOutputSessions())
    setJobs(await fetchOutputJobs())
    setStrategies(await fetchOutputStrategies())
  }

  useEffect(() => {
    load()
  }, [])

  async function processQueue() {
    setMessage(JSON.stringify(await processOutputQueue()))
    await load()
  }

  async function exportCsv(batch) {
    const total = await downloadBatchCsv(batch)
    setMessage(`CSV descargado con ${total} filas.`)
    await load()
  }

  return (
    <div>
      <div className="bar">
        <button className="primary" onClick={processQueue}>
          <PlayCircle size={16} />
          Procesar cola
        </button>
        <button onClick={load}>Refrescar</button>
      </div>

      {message && <div className="msg">{message}</div>}

      <div className="tabs">
        {['queue', 'batches', 'sessions', 'jobs', 'strategies'].map((item) => (
          <button key={item} className={tab === item ? 'on' : ''} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>

      {tab === 'queue' && (
        <section className="card">
          <h3>Cola de salida</h3>
          {queue.length ? (
            queue.map((row) => (
              <div className="row" key={row.id}>
                <span>{row.public_id || row.cases?.public_id}</span>
                <span>{row.case_type}</span>
                <span>{row.output_mode}</span>
                <span>{row.output_route}</span>
                <span>{row.destination_system}</span>
                <span>{row.status}</span>
                <span>{row.payload_status || 'ready'}</span>
                <span>{row.ready ? 'ready' : formatReasons(row.readiness_reasons)}</span>
              </div>
            ))
          ) : (
            <p>Sin registros.</p>
          )}
        </section>
      )}

      {tab === 'batches' && (
        <section className="card">
          <h3>Lotes CSV</h3>
          {batches.map((batch) => (
            <div className="row" key={batch.id}>
              <span>{batch.file_name}</span>
              <span>{batch.case_type}</span>
              <span>{batch.total_cases} casos</span>
              <span>{batch.status}</span>
              <span>{batch.payload_status || 'ready'}</span>
              <button onClick={() => exportCsv(batch)}>
                <Download size={14} /> CSV
              </button>
            </div>
          ))}
        </section>
      )}

      {tab === 'sessions' && (
        <List
          title="Sesiones Copilot"
          rows={sessions}
          cols={['session_name', 'case_type', 'total_cases', 'status', 'output_route']}
        />
      )}

      {tab === 'jobs' && <JobsPanel rows={jobs} reload={load} />}

      {tab === 'strategies' && (
        <List
          title="Estrategias"
          rows={strategies}
          cols={['case_type', 'output_route', 'output_mode', 'grouping_strategy', 'destination_system']}
        />
      )}
    </div>
  )
}

function JobsPanel({ rows, reload }) {
  const [message, setMessage] = useState('')

  async function simulateFailure(job) {
    await updateOutputJob(job.id, {
      status: 'failed',
      last_error: 'Error simulado',
      attempts: job.attempts || 0,
    })
    reload()
  }

  async function retry() {
    const total = await retryFailedJobs()
    setMessage(`Jobs reintentados: ${total}`)
    reload()
  }

  return (
    <section className="card">
      <h3>Jobs / Retry logic</h3>
      <button onClick={retry}>
        <RotateCcw size={14} /> Reintentar fallidos
      </button>
      {message && <div className="msg">{message}</div>}
      {rows.map((job) => (
        <div className="row" key={job.id}>
          <span>{job.output_route}</span>
          <span>{job.destination_system}</span>
          <span>{job.output_mode}</span>
          <span>{job.status}</span>
          <span>{job.payload_status || 'ready'}</span>
          <span>
            {job.attempts}/{job.max_attempts}
          </span>
          <span>{job.preview || job.last_error || ''}</span>
          <span>{job.payload_issues?.length ? formatReasons(job.payload_issues) : ''}</span>
          <button onClick={() => simulateFailure(job)}>simular fallo</button>
        </div>
      ))}
    </section>
  )
}

function formatReasons(reasons = []) {
  if (!reasons?.length) return 'sin bloqueos visibles'
  return reasons.map((item) => item.code).join(', ')
}
