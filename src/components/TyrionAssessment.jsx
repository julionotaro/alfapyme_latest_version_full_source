import { AlertTriangle, Bot, CheckCircle2, ShieldAlert } from 'lucide-react'

const DECISION_LABELS = {
  faltan_documentos_obligatorios: 'Faltan documentos obligatorios',
  requiere_revision_humana: 'Requiere revisión humana',
  completitud_minima_superada: 'Completitud mínima superada',
}

const STATE_LABELS = {
  pending_documents: 'Pendiente de documentos',
  human_validation: 'Validación humana',
  ready_for_output: 'Listo para salida',
}

export function TyrionAssessment({ assessment, compact = false }) {
  if (!assessment) return null

  const {
    requirement,
    decision,
    actionableMissingDocuments,
    lowConfidenceDocuments,
    automaticValidations,
    automaticValidationResults,
    failedCrossValidations,
    uiConflicts,
    actionableEscalations,
  } = assessment

  return (
    <section className="card tyrion-assessment">
      <h3>
        <Bot size={18} /> Tyrion · evaluación operativa
      </h3>

      <div className="tyrion-summary">
        <p>
          <b>Trámite:</b> {requirement.label}
        </p>
        <p>
          <b>Estado objetivo:</b> {STATE_LABELS[decision.targetState] || decision.targetState}
        </p>
        <p>
          <b>Decisión:</b> {DECISION_LABELS[decision.reason] || decision.reason}
        </p>
      </div>

      <div className="tyrion-next-step">
        <b>Siguiente paso:</b> {decision.actionHint}
      </div>

      {uiConflicts?.items?.length > 0 && (
        <div className="tyrion-conflict-summary">
          <span><b>{uiConflicts.blockedCount}</b> bloqueante(s)</span>
          <span><b>{uiConflicts.reviewCount}</b> revisable(s)</span>
        </div>
      )}

      {uiConflicts?.items?.length > 0 && (
        <div className="low tyrion-low-confidence">
          <b>Conflictos detectados:</b>
          <ul>
            {uiConflicts.items.slice(0, compact ? 3 : uiConflicts.items.length).map((item) => (
              <li key={item.code}>
                <b>{item.title}</b> · {item.severityLabel}<br />
                <small>{item.summary}</small><br />
                <small>Acción sugerida: {item.recommendedAction}</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      {compact ? null : (
        <>
          <div className="tyrion-grid">
            <div>
              <h4>
                <CheckCircle2 size={16} /> Validaciones automáticas
              </h4>
              <ul>
                {automaticValidations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {automaticValidationResults?.length > 0 && (
                <ul>
                  {automaticValidationResults.map((item) => (
                    <li key={item.code}>
                      <b>{item.label}:</b> {item.status === 'passed' ? 'ok' : 'revisar'} · {item.detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4>
                <AlertTriangle size={16} /> Faltantes obligatorios
              </h4>
              {actionableMissingDocuments.length ? (
                <ul>
                  {actionableMissingDocuments.map((item) => (
                    <li key={item.type}>
                      {item.label} <small>→ pedir a: {item.requestedFrom}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Sin faltantes obligatorios.</p>
              )}
            </div>

            <div>
              <h4>
                <ShieldAlert size={16} /> Escalado humano
              </h4>
              {actionableEscalations.length > 0 ? (
                <ul>
                  {actionableEscalations.map((item) => (
                    <li key={item.reason}>
                      {item.label} <small>→ revisar: {item.owner}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Sin escalados humanos activos.</p>
              )}
            </div>
          </div>

          {lowConfidenceDocuments.length > 0 && (
            <div className="low tyrion-low-confidence">
              <b>Documentos con baja confianza:</b>
              <ul>
                {lowConfidenceDocuments.map((document) => (
                  <li key={document.id}>
                    {document.file_name} · {document.document_type} · conf. {document.confidence}
                    {document.ai_payload?.extracted_fields?.plates?.length ? ` · mat.: ${document.ai_payload.extracted_fields.plates.join(', ')}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  )
}
