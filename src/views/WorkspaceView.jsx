import { AlertTriangle, CheckCircle2, Eye, XCircle } from 'lucide-react'
import { TyrionAssessment } from '../components/TyrionAssessment'
import { CASE_STATUS_LABELS } from '../constants'

export function WorkspaceView({
  cases,
  selected,
  selectedBusinessTemplate,
  setSelected,
  checklist,
  documents,
  onValidateItem,
  onReady,
  onApplyTyrionSuggestion,
  setActiveDoc,
  setView,
  missingBlocking,
  tyrionAssessment,
  tyrionTransition,
}) {
  const summary = buildCaseSummary(cases)

  return (
    <div className="supervision-layout">
      <section className="card supervision-main">
        <div className="section-head">
          <div>
            <h3>Bandeja de supervisión</h3>
            <p>Prioriza conflictos, revisa excepciones y deja lo sano avanzar.</p>
          </div>
        </div>

        <div className="summary-strip">
          {summary.map((item) => (
            <div key={item.label} className={`summary-card ${item.tone}`}>
              <span>{item.label}</span>
              <b>{item.value}</b>
            </div>
          ))}
        </div>

        <div className="case-list">
          {cases.map((currentCase) => {
            const selectedRow = selected?.id === currentCase.id
            const tone = resolveCaseTone(currentCase.status)

            return (
              <button key={currentCase.id} className={`case-row ${selectedRow ? 'sel' : ''}`} onClick={() => setSelected(currentCase)}>
                <div>
                  <b>{currentCase.public_id}</b>
                  <small>{currentCase.client_name}</small>
                </div>
                <div>
                  <b>{humanizeCaseType(currentCase.case_type)}</b>
                  <small>{currentCase.vehicle_plate || 'Matrícula pendiente'}</small>
                </div>
                <div>
                  <span className={`status-pill ${tone}`}>{CASE_STATUS_LABELS[currentCase.status] || currentCase.status}</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="panel supervision-panel">
        <div className="section-head">
          <div>
            <h3>{selected?.public_id || 'Sin expediente seleccionado'}</h3>
            <p>{selected?.client_name || 'Selecciona un expediente para revisar su situación real.'}</p>
          </div>
          {selected && <span className={`status-pill ${resolveCaseTone(selected.status)}`}>{CASE_STATUS_LABELS[selected.status] || selected.status}</span>}
        </div>

        {selectedBusinessTemplate && (
          <p className="muted-line">
            <b>Template:</b> {selectedBusinessTemplate.label} <small>· vertical {selectedBusinessTemplate.vertical}</small>
          </p>
        )}

        {tyrionTransition && (
          <div className="tyrion-transition-box">
            <b>Tyrion sugiere transición controlada</b>
            <p>
              Plantilla: {tyrionTransition.templateLabel} · estado actual:{' '}
              {CASE_STATUS_LABELS[tyrionTransition.currentStatus] || tyrionTransition.currentStatus || 'sin estado'} · siguiente estado:{' '}
              {CASE_STATUS_LABELS[tyrionTransition.nextStatus] || tyrionTransition.nextStatus}
            </p>
            <small>{tyrionTransition.resolutionHint}</small>
            {tyrionTransition.shouldApply ? (
              <div>
                <button className="secondary" onClick={onApplyTyrionSuggestion}>
                  Aplicar sugerencia de Tyrion
                </button>
              </div>
            ) : (
              <p className="ok">El expediente ya está en el estado sugerido por Tyrion.</p>
            )}
          </div>
        )}

        <div className="supervision-split">
          <div>
            <h4>Checklist documental</h4>
            {checklist.map((item) => (
              <div className="item" key={item.id}>
                {item.status === 'missing' ? (
                  <XCircle />
                ) : item.validation_status === 'needs_review' ? (
                  <AlertTriangle />
                ) : (
                  <CheckCircle2 />
                )}

                <div>
                  <b>{item.document_label}</b>
                  <small>
                    {item.is_blocking ? 'Bloqueante' : 'No bloqueante'} · {item.status} · {item.validation_status}
                    {item.source === 'template' ? ' · derivado de plantilla' : ''}
                  </small>
                </div>

                {item.document_id && item.validation_status !== 'validated' && item.source !== 'template' && (
                  <button onClick={() => onValidateItem(item)}>Validar</button>
                )}
              </div>
            ))}
          </div>

          <div>
            <h4>Documentos del expediente</h4>
            {documents.length ? documents.map((document) => (
              <div className="doc-row" key={document.id}>
                <div>
                  <b>{document.file_name}</b>
                  <small>{document.document_type} · conf. {document.confidence}</small>
                </div>
                <button
                  onClick={() => {
                    setActiveDoc(document)
                    setView('viewer')
                  }}
                >
                  <Eye size={14} /> ver
                </button>
              </div>
            )) : <p className="muted-line">Sin documentos cargados todavía.</p>}
          </div>
        </div>

        <div className="action-strip">
          <button className="primary" onClick={onReady}>
            Confirmar y pasar a salida
          </button>
          <p className="warn">
            {missingBlocking > 0
              ? `Faltan bloqueantes: ${missingBlocking}`
              : 'Sin bloqueantes pendientes'}
          </p>
        </div>

        <TyrionAssessment assessment={tyrionAssessment} />
      </section>

      <section className="card supervision-focus">
        <h3>Foco operativo</h3>
        <ul>
          <li><b>{cases.filter((item) => ['blocked', 'human_validation', 'waiting_human'].includes(item.status)).length}</b> expediente(s) requieren atención directa.</li>
          <li><b>{cases.filter((item) => item.status === 'ready_for_output').length}</b> expediente(s) están listos para salida.</li>
          <li><b>{cases.filter((item) => item.status === 'received').length}</b> expediente(s) acaban de entrar.</li>
        </ul>

        <div className="focus-box">
          <b>Sugerencia operativa</b>
          <p>
            Empieza por los expedientes bloqueados o en validación humana. Lo demás puede esperar sin drama.
          </p>
        </div>
      </section>
    </div>
  )
}

function humanizeCaseType(value) {
  return String(value || 'sin clasificar')
    .replace(/_/g, ' ')
}

function resolveCaseTone(status) {
  if (['blocked', 'failed'].includes(status)) return 'danger'
  if (['human_validation', 'waiting_human', 'pending_client', 'waiting_input'].includes(status)) return 'warning'
  if (['ready_for_output', 'completed'].includes(status)) return 'success'
  return 'neutral'
}

function buildCaseSummary(cases = []) {
  return [
    { label: 'Recibidos', value: cases.filter((item) => item.status === 'received').length, tone: 'neutral' },
    { label: 'En revisión', value: cases.filter((item) => ['human_validation', 'waiting_human'].includes(item.status)).length, tone: 'warning' },
    { label: 'Bloqueados', value: cases.filter((item) => item.status === 'blocked').length, tone: 'danger' },
    { label: 'Listos salida', value: cases.filter((item) => item.status === 'ready_for_output').length, tone: 'success' },
  ]
}
