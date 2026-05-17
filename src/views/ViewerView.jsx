export function ViewerView({ selected, documents, activeDoc, setActiveDoc, docUrl, checklist }) {
  return (
    <div className="viewer">
      <section className="doclist">
        <h3>{selected?.public_id}</h3>
        {documents.map((document) => (
          <button
            key={document.id}
            className={activeDoc?.id === document.id ? 'on' : ''}
            onClick={() => setActiveDoc(document)}
          >
            {document.file_name}
            <small>
              {document.document_type} · conf. {document.confidence}
            </small>
          </button>
        ))}
      </section>

      <section className="docview">
        {docUrl ? (
          activeDoc?.file_type?.startsWith('image/') ? (
            <img src={docUrl} alt={activeDoc?.file_name || 'Documento'} />
          ) : (
            <iframe src={docUrl} title={activeDoc?.file_name || 'Documento'} />
          )
        ) : (
          <p>Selecciona documento.</p>
        )}
      </section>

      <section className="extract">
        <h3>Extracción / confianza</h3>
        {activeDoc && (
          <>
            <p>
              <b>Tipo:</b> {activeDoc.document_type}
            </p>
            <p>
              <b>Confianza:</b> {activeDoc.confidence}
            </p>
            <p>
              <b>Fuente de ingesta:</b> {activeDoc.ai_payload?.ingestion_source || 'desconocida'}
            </p>
            <p>
              <b>Páginas:</b> {activeDoc.ai_payload?.ingestion_page_count || 0} · procesadas {activeDoc.ai_payload?.ingestion_pages_processed || 0}
            </p>
            <p>
              <b>OCR:</b> {activeDoc.ocr_text}
            </p>
            {activeDoc.ai_payload?.ingestion_warnings?.length > 0 && (
              <p>
                <b>Warnings:</b> {activeDoc.ai_payload.ingestion_warnings.join(', ')}
              </p>
            )}
            {Number(activeDoc.confidence) < 0.85 && (
              <div className="low">Baja confianza: requiere revisión humana.</div>
            )}
          </>
        )}

        <h4>Checklist</h4>
        {checklist.map((item) => (
          <p key={item.id}>
            • {item.document_label}: <b>{item.validation_status}</b>
          </p>
        ))}
      </section>
    </div>
  )
}
