import { Eye } from 'lucide-react'

export function ValidationView({
  cases = [],
  selected,
  onSelectCase,
  documents = [],
  activeDoc,
  setActiveDoc,
  docUrl,
  checklist = [],
  tyrionAssessment,
  onOpenTray,
}) {
  const reviewRows = cases.filter((item) => ['human_validation', 'waiting_human', 'blocked', 'failed', 'pending_client', 'triaged'].includes(item.status))

  return (
    <div className="validation-reference-layout">
      <section className="surface-card validation-list-panel">
        <div className="section-head compact-head">
          <div>
            <h3>Origen · documentos</h3>
            <p>Selecciona el expediente que quieras revisar.</p>
          </div>
        </div>

        <div className="review-case-list">
          {reviewRows.length ? reviewRows.map((item) => (
            <button key={item.id} className={`review-case-item ${selected?.id === item.id ? 'on' : ''}`} onClick={() => onSelectCase(item)}>
              <b>{item.public_id}</b>
              <small>{item.client_name || 'Sin cliente'}</small>
              <span>{humanize(item.case_type)}</span>
            </button>
          )) : <p className="muted-line">No hay expedientes pendientes de validación.</p>}
        </div>
      </section>

      <section className="surface-card document-stage-panel">
        <div className="split-toolbar">
          <div>
            <span className="page-kicker">Área de trabajo</span>
            <h3>{selected?.public_id || 'Validación split-view'}</h3>
          </div>
          <button onClick={onOpenTray}><Eye size={14} /> Abrir bandeja</button>
        </div>

        <div className="document-split-shell">
          <div className="doc-strip">
            {documents.length ? documents.map((document, index) => (
              <button key={document.id} className={`doc-thumb ${activeDoc?.id === document.id ? 'on' : ''}`} onClick={() => setActiveDoc(document)}>
                <span>{index + 1}</span>
                <small>{humanize(document.document_type)}</small>
              </button>
            )) : <div className="empty-preview">Sin documentos</div>}
          </div>

          <div className="doc-canvas">
            {docUrl ? (
              activeDoc?.file_type?.startsWith('image/') ? (
                <img src={docUrl} alt={activeDoc?.file_name || 'Documento'} />
              ) : (
                <iframe src={docUrl} title={activeDoc?.file_name || 'Documento'} />
              )
            ) : (
              <div className="empty-preview">Selecciona un documento para revisar la lectura.</div>
            )}
          </div>
        </div>
      </section>

      <section className="surface-card extraction-panel">
        <div className="section-head compact-head">
          <div>
            <h3>Resultado · datos extraídos</h3>
            <p>Mostramos la lectura útil, no todo el barro interno.</p>
          </div>
        </div>

        <div className="extraction-fields">
          <ExtractionField label="Trámite inferido" value={tyrionAssessment?.requirement?.label || humanize(selected?.case_type) || 'Sin inferencia aún'} confidence={confidenceBadge(activeDoc?.confidence)} />
          <ExtractionField label="Documento activo" value={activeDoc?.file_name || 'Sin documento seleccionado'} confidence={confidenceBadge(activeDoc?.confidence)} />
          <ExtractionField label="Tipo detectado" value={humanize(activeDoc?.document_type) || 'Sin detectar'} confidence={confidenceBadge(activeDoc?.confidence)} />
          <ExtractionField label="Matrícula" value={selected?.vehicle_plate || getExtractedPlate(activeDoc) || 'No detectada todavía'} confidence={selected?.vehicle_plate || getExtractedPlate(activeDoc) ? 'ok' : 'revisar'} />
          <ExtractionField label="Checklist corto" value={checklistSummary(checklist)} confidence={checklist.some((item) => item.is_blocking && item.status === 'missing') ? 'revisar' : 'ok'} />
          <ExtractionField label="Acción siguiente" value={actionLabel(selected, tyrionAssessment, checklist)} confidence="ok" />
        </div>

        <div className="split-actions">
          <button>Guardar cambios</button>
          <button className="primary" onClick={onOpenTray}>Volver a bandeja</button>
        </div>
      </section>
    </div>
  )
}

function ExtractionField({ label, value, confidence }) {
  return (
    <div className="extract-field">
      <span>{label}</span>
      <div>
        <b>{value}</b>
        <em className={`confidence-badge ${confidence}`}>{confidenceLabel(confidence)}</em>
      </div>
    </div>
  )
}

function humanize(value) {
  return String(value || '').replace(/_/g, ' ')
}

function getExtractedPlate(doc) {
  return doc?.ai_payload?.extracted_fields?.plates?.[0] || ''
}

function checklistSummary(checklist = []) {
  if (!checklist.length) return 'Sin checklist proyectado'
  const missing = checklist.filter((item) => item.status === 'missing').length
  const validated = checklist.filter((item) => item.validation_status === 'validated').length
  return `${validated} validado(s) · ${missing} faltante(s)`
}

function actionLabel(selected, assessment, checklist = []) {
  const missingBlocking = checklist.filter((item) => item.is_blocking && item.status === 'missing').length
  if (missingBlocking > 0) return 'Pedir o validar faltantes bloqueantes'
  if (assessment?.lowConfidenceDocuments?.length) return 'Revisar lectura dudosa'
  if (selected?.status === 'ready_for_output') return 'Ejecutar salida'
  return 'Confirmar lectura del expediente'
}

function confidenceBadge(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return 'medio'
  if (n >= 0.9) return 'ok'
  if (n >= 0.75) return 'medio'
  return 'revisar'
}

function confidenceLabel(value) {
  if (value === 'ok') return 'alta'
  if (value === 'revisar') return 'revisar'
  return 'media'
}
