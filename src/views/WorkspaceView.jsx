import { AlertTriangle, CheckCircle2, Eye, XCircle } from 'lucide-react'
import { TyrionAssessment } from '../components/TyrionAssessment'
import { CASE_STATUS_LABELS } from '../constants'

export function WorkspaceView({
  cases,
  selected,
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
    <div className="grid">
      <section className="card">
        <h3>Casos</h3>
        <table>
          <tbody>
            {cases.map((currentCase) => (
              <tr
                key={currentCase.id}
                onClick={() => setSelected(currentCase)}
                className={selected?.id === currentCase.id ? 'sel' : ''}
              >
                <td>{currentCase.public_id}</td>
                <td>{currentCase.client_name}</td>
                <td>{currentCase.case_type}</td>
                <td>{CASE_STATUS_LABELS[currentCase.status] || currentCase.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h3>{selected?.public_id || 'Sin caso'}</h3>
        <p>{selected?.client_name}</p>

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

        <h4>Documentos</h4>
        {documents.map((document) => (
          <p key={document.id}>
            • {document.file_name} <b>{document.document_type}</b>{' '}
            <button
              onClick={() => {
                setActiveDoc(document)
                setView('viewer')
              }}
            >
              <Eye size={14} /> ver
            </button>
          </p>
        ))}

        <button className="primary" onClick={onReady}>
          Confirmar y pasar a salida
        </button>
        <p className="warn">
          {missingBlocking > 0
            ? `Faltan bloqueantes: ${missingBlocking}`
            : 'Sin bloqueantes pendientes'}
        </p>

        <TyrionAssessment assessment={tyrionAssessment} />
      </section>
    </div>
  )
}
