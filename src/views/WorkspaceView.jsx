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
  return (
    <div className="workspace-v2">
      <section className="card tray-panel">
        <div className="tray-head">
          <h3>Expedientes</h3>
          <small>{cases.length} activo(s)</small>
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

      <section className="panel detail-panel">
        <div className="section-head">
          <div>
            <h3>{selected?.public_id || 'Sin expediente seleccionado'}</h3>
            <p>{selected?.client_name || 'Selecciona un expediente.'}</p>
          </div>
          {selected && <span className={`status-pill ${resolveCaseTone(selected.status)}`}>{CASE_STATUS_LABELS[selected.status] || selected.status}</span>}
        </div>

        {selectedBusinessTemplate && (
          <p className="muted-line">
            <b>Template:</b> {selectedBusinessTemplate.label} <small>· vertical {selectedBusinessTemplate.vertical}</small>
          </p>
        )}

        <div className="mini-summary">
          <div>
            <span>Trámite</span>
            <b>{humanizeCaseType(selected?.case_type)}</b>
          </div>
          <div>
            <span>Matrícula</span>
            <b>{selected?.vehicle_plate || 'Pendiente'}</b>
          </div>
          <div>
            <span>Bloqueantes</span>
            <b>{missingBlocking}</b>
          </div>
        </div>

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

        <div className="detail-grid">
          <div>
            <h4>Conflictos y decisión</h4>
            <TyrionAssessment assessment={tyrionAssessment} compact />
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

            <h4>Checklist corto</h4>
            <div className="checklist-short">
              {checklist.slice(0, 6).map((item) => (
                <div className="checklist-row" key={item.id}>
                  <span>{item.status === 'missing' ? '✕' : item.validation_status === 'needs_review' ? '!' : '✓'}</span>
                  <div>
                    <b>{item.document_label}</b>
                    <small>{item.status} · {item.is_blocking ? 'bloqueante' : 'no bloqueante'}</small>
                  </div>
                  {item.document_id && item.validation_status !== 'validated' && item.source !== 'template' && (
                    <button onClick={() => onValidateItem(item)}>Validar</button>
                  )}
                </div>
              ))}
            </div>
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
