import { useEffect, useMemo, useState } from 'react'
import { Eye, PencilLine, Save } from 'lucide-react'
import { getDocumentConfidenceReasons } from '../domain/tyrion/confidence-explanations.js'
import { shouldUseMvpDocumentReviewMode } from '../domain/tyrion/mvp-mode.js'

const DOCUMENT_TYPE_OPTIONS = [
  'cti_transferencia',
  'cti_herencia',
  'permiso_circulacion',
  'ficha_tecnica',
  'contrato_factura',
  'justificante_pago',
  'dni_comprador',
  'dni_vendedor',
  'modelo_650',
  'relacion_bienes_650',
  'solicitud_cambio_fallecimiento',
  'certificado_defuncion',
  'mandato_gestoria',
  'empadronamiento',
  'solicitud_duplicado',
  'solicitud_baja',
  'dua',
  'documentacion_extranjera',
]

const CASE_TYPE_OPTIONS = [
  'transferencia',
  'transferencia_sucesion',
  'notificacion_venta',
  'aceptacion_venta',
  'cambio_domicilio',
  'baja_temporal',
  'baja_definitiva',
  'matriculacion',
  'matriculacion_importacion',
  'duplicado',
]

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
  onSaveEdits,
  saving = false,
}) {
  const reviewRows = cases.filter((item) => ['human_validation', 'waiting_human', 'blocked', 'failed', 'pending_client', 'triaged', 'received'].includes(item.status))

  const formState = useMemo(() => buildFormState({ selected, activeDoc, tyrionAssessment }), [selected, activeDoc, tyrionAssessment])
  const [draft, setDraft] = useState(formState)

  useEffect(() => {
    setDraft(formState)
  }, [formState])

  const lowConfidence = Number(activeDoc?.confidence ?? 0) < 0.85

  return (
    <div className="validation-reference-layout validation-editable-layout">
      <section className="surface-card validation-list-panel">
        <div className="section-head compact-head">
          <div>
            <h3>Origen · expedientes</h3>
            <p>Abre uno y corrige donde la IA no llega sola.</p>
          </div>
        </div>

        <div className="review-case-list">
          {reviewRows.length ? reviewRows.map((item) => (
            <button key={item.id} className={`review-case-item ${selected?.id === item.id ? 'on' : ''}`} onClick={() => onSelectCase(item)}>
              <b>{item.public_id}</b>
              <small>{item.client_name || 'Sin cliente'}</small>
              <span>{humanize(item.case_type || 'pending_classification')}</span>
            </button>
          )) : <p className="muted-line">No hay expedientes pendientes de validación.</p>}
        </div>
      </section>

      <section className="surface-card document-stage-panel">
        <div className="split-toolbar">
          <div>
            <span className="page-kicker">Área de trabajo</span>
            <h3>{selected?.public_id || 'Validación IA'}</h3>
            <p className="validation-subhead">Aquí deberías poder corregir, no solo mirar.</p>
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

      <section className="surface-card extraction-panel extraction-edit-panel">
        <div className="section-head compact-head">
          <div>
            <h3>Corrección humana</h3>
            <p>{lowConfidence ? 'La IA llegó con dudas. Aquí mandas tú.' : 'Puedes confirmar o corregir antes de seguir.'}</p>
          </div>
        </div>

        <div className="editable-summary-box">
          <div>
            <span className="page-kicker">Trámite inferido</span>
            <b>{tyrionAssessment?.requirement?.label || humanize(selected?.case_type) || 'Sin inferencia aún'}</b>
          </div>
          <em className={`confidence-badge ${lowConfidence ? 'revisar' : 'ok'}`}>{lowConfidence ? 'baja' : 'alta'}</em>
        </div>

        {lowConfidence && activeDoc && (
          <div className="low tyrion-low-confidence">
            <b>Por qué este documento queda en revisión</b>
            <ul>
              {getDocumentConfidenceReasons(activeDoc).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="validation-edit-grid">
          <EditableField label="Trámite" type="select" value={draft.caseType} onChange={(value) => patchDraft(setDraft, 'caseType', value)} options={CASE_TYPE_OPTIONS} />
          <EditableField label="Tipo documental" type="select" value={draft.documentType} onChange={(value) => patchDraft(setDraft, 'documentType', value)} options={DOCUMENT_TYPE_OPTIONS} />
          <EditableField label="Matrícula" value={draft.plate} onChange={(value) => patchDraft(setDraft, 'plate', value.toUpperCase())} />
          <EditableField label="Bastidor" value={draft.vin} onChange={(value) => patchDraft(setDraft, 'vin', value.toUpperCase())} />
          <EditableField label="Comprador" value={draft.buyerName} onChange={(value) => patchDraft(setDraft, 'buyerName', value)} />
          <EditableField label="Vendedor" value={draft.sellerName} onChange={(value) => patchDraft(setDraft, 'sellerName', value)} />
          <EditableField label="Titular" value={draft.ownerName} onChange={(value) => patchDraft(setDraft, 'ownerName', value)} />
          <EditableField label="Heredero" value={draft.heirName} onChange={(value) => patchDraft(setDraft, 'heirName', value)} />
          <EditableField label="Fallecido" value={draft.deceasedName} onChange={(value) => patchDraft(setDraft, 'deceasedName', value)} />
        </div>

        <div className="editable-notes-box">
          <div>
            <PencilLine size={14} />
            <span>{actionLabel(selected, tyrionAssessment, checklist)}</span>
          </div>
          <label className="review-checkbox">
            <input type="checkbox" checked={draft.forceReviewed} onChange={(event) => patchDraft(setDraft, 'forceReviewed', event.target.checked)} />
            Marcar como revisado manualmente
          </label>
        </div>

        <div className="split-actions">
          <button onClick={() => setDraft(formState)} disabled={saving}>Restablecer</button>
          <button className="primary" onClick={() => onSaveEdits?.(draft)} disabled={saving || !selected || !activeDoc}>
            <Save size={14} /> {saving ? 'Guardando…' : 'Guardar corrección'}
          </button>
        </div>
      </section>
    </div>
  )
}

function EditableField({ label, value, onChange, type = 'text', options = [] }) {
  return (
    <label className="editable-field">
      <span>{label}</span>
      {type === 'select' ? (
        <select value={value || ''} onChange={(event) => onChange(event.target.value)}>
          <option value="">Sin definir</option>
          {options.map((option) => (
            <option key={option} value={option}>{humanize(option)}</option>
          ))}
        </select>
      ) : (
        <input value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder={`Corregir ${label.toLowerCase()}`} />
      )}
    </label>
  )
}

function buildFormState({ selected, activeDoc, tyrionAssessment }) {
  const fields = activeDoc?.ai_payload?.extracted_fields || {}
  return {
    caseType: selected?.case_type || tyrionAssessment?.requirement?.code || '',
    documentType: activeDoc?.document_type || '',
    plate: selected?.vehicle_plate || fields.plates?.[0] || '',
    vin: fields.vin || '',
    buyerName: fields.buyerName || '',
    sellerName: fields.sellerName || '',
    ownerName: fields.ownerName || '',
    heirName: fields.heirName || '',
    deceasedName: fields.deceasedName || '',
    forceReviewed: Number(activeDoc?.confidence ?? 0) < 0.85,
  }
}

function patchDraft(setDraft, key, value) {
  setDraft((current) => ({ ...current, [key]: value }))
}

function humanize(value) {
  return String(value || '').replace(/_/g, ' ')
}

function actionLabel(selected, assessment, checklist = []) {
  const missingBlocking = checklist.filter((item) => item.is_blocking && item.status === 'missing').length
  if (!shouldUseMvpDocumentReviewMode() && missingBlocking > 0) return 'Antes de seguir, sigue habiendo faltantes bloqueantes.'
  if (assessment?.lowConfidenceDocuments?.length) return 'Esto no está bloqueado por faltantes: quedó en revisión porque al menos un documento no se leyó con fiabilidad suficiente.'
  if (selected?.status === 'ready_for_output') return 'Si todo cuadra, el expediente ya puede salir.'
  return 'Confirma o corrige la lectura antes de avanzar.'
}
