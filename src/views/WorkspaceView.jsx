import { Eye } from 'lucide-react'
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
            <p>{selected?.client_name || 'Selecciona un expediente para ver qué entendió la IA.'}</p>
          </div>
          {selected && <span className={`status-pill ${resolveCaseTone(selected.status)}`}>{humanReadableStatus(selected.status, tyrionAssessment)}</span>}
        </div>

        {selected && (
          <>
            <div className="case-summary-hero card">
              <div className="hero-main">
                <span className="eyebrow">Qué entendió la IA</span>
                <h4>{getInferredProcedureLabel(selected, tyrionAssessment)}</h4>
                <p>{getInferenceSummary(selected, tyrionAssessment, documents)}</p>
              </div>
              <div className="hero-stats">
                <div>
                  <span>Documentos cargados</span>
                  <b>{documents.length}</b>
                </div>
                <div>
                  <span>Confianza</span>
                  <b>{getConfidenceLabel(tyrionAssessment, documents)}</b>
                </div>
                <div>
                  <span>Datos clave</span>
                  <b>{getDetectedKeyDataLabel(selected, documents)}</b>
                </div>
              </div>
            </div>

            <div className="next-action-box">
              <div>
                <span className="eyebrow">Qué tenés que hacer ahora</span>
                <h4>{getPrimaryActionTitle(selected, tyrionAssessment, missingBlocking)}</h4>
                <p>{getPrimaryActionDetail(selected, tyrionAssessment, missingBlocking)}</p>
              </div>
              <div className="next-action-cta">
                {tyrionTransition?.shouldApply ? (
                  <button className="secondary" onClick={onApplyTyrionSuggestion}>
                    Confirmar lectura sugerida
                  </button>
                ) : (
                  <button className="primary" onClick={onReady}>
                    Pasar a salida
                  </button>
                )}
              </div>
            </div>

            <div className="workspace-clean-grid">
              <div className="card">
                <h4>Qué falta para avanzar</h4>
                <div className="signal-list">
                  {buildMissingSignals({ checklist, tyrionAssessment, selected }).map((item) => (
                    <div key={item.label} className={`signal-item ${item.tone}`}>
                      <b>{item.label}</b>
                      <small>{item.detail}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h4>Documentos cargados</h4>
                {documents.length ? documents.map((document) => (
                  <div className="doc-row" key={document.id}>
                    <div>
                      <b>{document.file_name}</b>
                      <small>{humanizeDocType(document.document_type)} · conf. {document.confidence ?? 'n/d'}</small>
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

            <div className="workspace-clean-grid secondary-grid">
              <div className="card">
                <h4>Checklist corto</h4>
                <div className="checklist-short">
                  {checklist.slice(0, 6).map((item) => (
                    <div className="checklist-row" key={item.id}>
                      <span>{item.status === 'missing' ? '✕' : item.validation_status === 'needs_review' ? '!' : '✓'}</span>
                      <div>
                        <b>{item.document_label}</b>
                        <small>{humanReadableChecklistStatus(item)}</small>
                      </div>
                      {item.document_id && item.validation_status !== 'validated' && item.source !== 'template' && (
                        <button onClick={() => onValidateItem(item)}>Validar</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h4>Lectura operativa</h4>
                <div className="signal-list">
                  {buildOperationalSignals({ selected, tyrionAssessment, selectedBusinessTemplate }).map((item) => (
                    <div key={item.label} className="signal-item neutral">
                      <b>{item.label}</b>
                      <small>{item.detail}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function humanizeCaseType(value) {
  return String(value || 'sin clasificar').replace(/_/g, ' ')
}

function humanizeDocType(value) {
  return String(value || 'documento').replace(/_/g, ' ')
}

function resolveCaseTone(status) {
  if (['blocked', 'failed'].includes(status)) return 'danger'
  if (['human_validation', 'waiting_human', 'pending_client', 'waiting_input', 'triaged'].includes(status)) return 'warning'
  if (['ready_for_output', 'completed'].includes(status)) return 'success'
  return 'neutral'
}

function humanReadableStatus(status, assessment) {
  if (status === 'triaged' && assessment?.requirement?.label) return 'Trámite inferido, pendiente de confirmación'
  if (status === 'human_validation') return 'Pendiente de revisión humana'
  if (status === 'ready_for_output') return 'Listo para salida'
  return CASE_STATUS_LABELS[status] || status
}

function getInferredProcedureLabel(selected, assessment) {
  if (assessment?.requirement?.label) return assessment.requirement.label
  if (selected?.case_type) return humanizeCaseType(selected.case_type)
  return 'Todavía no hay trámite claro'
}

function getInferenceSummary(selected, assessment, documents) {
  if (!documents.length) return 'Todavía no hay documentos suficientes para inferir nada útil.'
  if (assessment?.decision?.actionHint) return assessment.decision.actionHint
  if (selected?.case_type) return `La IA detectó indicios de ${humanizeCaseType(selected.case_type)}, pero todavía necesita confirmación.`
  return 'Hay documentos cargados, pero el expediente todavía necesita una lectura más clara.'
}

function getConfidenceLabel(assessment, documents = []) {
  if (assessment?.lowConfidenceDocuments?.length) return 'baja'
  if (!documents.length) return 'sin datos'
  const avg = documents
    .map((item) => Number(item.confidence) || 0)
    .filter((value) => value > 0)
  if (!avg.length) return 'media'
  const score = avg.reduce((a, b) => a + b, 0) / avg.length
  if (score >= 0.85) return 'alta'
  if (score >= 0.65) return 'media'
  return 'baja'
}

function getDetectedKeyDataLabel(selected, documents = []) {
  const hasPlate = Boolean(selected?.vehicle_plate) || documents.some((item) => item?.ai_payload?.extracted_fields?.plates?.length)
  const names = documents.some((item) => {
    const fields = item?.ai_payload?.extracted_fields || {}
    return Boolean(fields.buyer_name || fields.seller_name || fields.names?.length)
  })
  if (hasPlate && names) return 'matrícula y partes detectadas'
  if (hasPlate) return 'matrícula detectada'
  if (names) return 'partes detectadas'
  return 'datos aún incompletos'
}

function getPrimaryActionTitle(selected, assessment, missingBlocking) {
  if (missingBlocking > 0) return 'Pedir o validar los documentos que bloquean el expediente'
  if (assessment?.uiConflicts?.blockedCount > 0) return 'Revisar el conflicto bloqueante antes de avanzar'
  if (assessment?.lowConfidenceDocuments?.length) return 'Revisar documento con lectura dudosa'
  if (selected?.status === 'triaged') return 'Confirmar el trámite inferido'
  if (selected?.status === 'ready_for_output') return 'Ejecutar la salida del expediente'
  return 'Revisar el expediente y confirmar el siguiente paso'
}

function getPrimaryActionDetail(selected, assessment, missingBlocking) {
  if (missingBlocking > 0) return `Hay ${missingBlocking} faltante(s) bloqueante(s). Hasta resolverlos, moverlo a salida sería maquillar el problema.`
  if (assessment?.uiConflicts?.blockedCount > 0) return `${assessment.uiConflicts.blockedCount} conflicto(s) bloqueante(s) detectado(s) por la IA.`
  if (assessment?.lowConfidenceDocuments?.length) return 'La inferencia existe, pero hay documentos con baja confianza que conviene abrir antes de confirmar.'
  if (selected?.status === 'triaged') return 'El sistema ya sugiere un trámite probable; ahora toca validarlo o corregirlo.'
  if (selected?.status === 'ready_for_output') return 'El expediente ya está listo para pasar al modo de salida correspondiente.'
  return assessment?.decision?.actionHint || 'Usa esta bandeja para decidir qué falta y qué hacer después.'
}

function buildMissingSignals({ checklist = [], tyrionAssessment, selected }) {
  const items = []
  const blocking = checklist.filter((item) => item.is_blocking && (item.status === 'missing' || ['missing', 'needs_review', 'rejected'].includes(item.validation_status)))
  blocking.slice(0, 4).forEach((item) => {
    items.push({ label: item.document_label, detail: item.status === 'missing' ? 'Documento faltante.' : 'Documento pendiente de validación.', tone: 'danger' })
  })
  tyrionAssessment?.lowConfidenceDocuments?.slice(0, 2).forEach((doc) => {
    items.push({ label: doc.file_name, detail: `Lectura dudosa (${doc.confidence ?? 'n/d'}).`, tone: 'warning' })
  })
  if (tyrionAssessment?.uiConflicts?.items?.length) {
    tyrionAssessment.uiConflicts.items.slice(0, 2).forEach((item) => {
      items.push({ label: item.title, detail: item.summary, tone: item.severity === 'blocking' ? 'danger' : 'warning' })
    })
  }
  if (!items.length) {
    items.push({ label: 'Sin bloqueos visibles', detail: selected?.status === 'ready_for_output' ? 'El expediente puede continuar a salida.' : 'No aparecen faltantes críticos en esta instancia.', tone: 'success' })
  }
  return items
}

function buildOperationalSignals({ selected, tyrionAssessment, selectedBusinessTemplate }) {
  return [
    {
      label: 'Estado actual',
      detail: humanReadableStatus(selected?.status, tyrionAssessment),
    },
    {
      label: 'Plantilla activa',
      detail: selectedBusinessTemplate ? `${selectedBusinessTemplate.label} · ${selectedBusinessTemplate.vertical}` : 'Sin plantilla visible',
    },
    {
      label: 'Matrícula',
      detail: selected?.vehicle_plate || 'Todavía no detectada o no confirmada',
    },
    {
      label: 'Siguiente estado sugerido',
      detail: tyrionAssessment?.decision?.targetState ? humanReadableStatus(tyrionAssessment.decision.targetState, tyrionAssessment) : 'Sin sugerencia aún',
    },
  ]
}

function humanReadableChecklistStatus(item) {
  if (item.status === 'missing') return item.is_blocking ? 'faltante bloqueante' : 'faltante no bloqueante'
  if (item.validation_status === 'needs_review') return 'requiere revisión'
  if (item.validation_status === 'validated') return 'validado'
  return `${item.status} · ${item.is_blocking ? 'bloqueante' : 'no bloqueante'}`
}
