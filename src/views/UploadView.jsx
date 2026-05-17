import { useState } from 'react'
import { UploadCloud } from 'lucide-react'

export function UploadView({ selected, selectedBusinessTemplate, cases, setSelected, onUploadFiles, onInspectFiles, inspections = [] }) {
  const [isOver, setIsOver] = useState(false)
  const [files, setFiles] = useState([])

  return (
    <div className="card upload">
      <h3>Subida múltiple documental</h3>
      {selectedBusinessTemplate && (
        <p>
          <b>Template activo:</b> {selectedBusinessTemplate.label} <small>· inputs {selectedBusinessTemplate.inputChannels.join(', ')}</small>
        </p>
      )}

      <select
        value={selected?.id || ''}
        onChange={(event) => setSelected(cases.find((currentCase) => currentCase.id === event.target.value))}
      >
        {cases.map((currentCase) => (
          <option key={currentCase.id} value={currentCase.id}>
            {currentCase.public_id} · {currentCase.client_name}
          </option>
        ))}
      </select>

      <div
        className={`drop ${isOver ? 'over' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setIsOver(true)
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsOver(false)
          setFiles([...event.dataTransfer.files])
        }}
      >
        <UploadCloud size={42} />
        <b>Arrastra varios PDF/imágenes</b>
        <p>o selecciona archivos</p>
        <input
          multiple
          type="file"
          accept=".pdf,image/*"
          onChange={(event) => setFiles([...event.target.files])}
        />
      </div>

      {files.length > 0 && (
        <div className="selected">
          <b>{files.length} archivo(s) seleccionados</b>
          {files.map((file) => (
            <p key={`${file.name}-${file.size}`}>{file.name}</p>
          ))}
          <button onClick={() => onInspectFiles(files)}>Preanalizar archivos</button>
          <button className="primary" onClick={() => onUploadFiles(files)}>
            Subir archivos
          </button>
        </div>
      )}

      {inspections.length > 0 && (
        <div className="selected">
          <b>Salida de preanálisis</b>
          {inspections.map((inspection) => (
            <div key={`${inspection.fileName}-${inspection.source}`} style={{ marginTop: 12 }}>
              <p><b>{inspection.fileName}</b></p>
              <p>Fuente: {inspection.source} · tipo base: {inspection.documentKind}</p>
              <p>Páginas: {inspection.pageCount || 0} · procesadas: {inspection.pagesProcessed || 0}</p>
              <p>Tipo detectado: {inspection.analysis?.documentType || 'sin detectar'}</p>
              <p>Confianza: {inspection.analysis?.confidence ?? 'n/a'}</p>
              <p>Campos: {Object.keys(inspection.analysis?.extractedFields || {}).length ? JSON.stringify(inspection.analysis?.extractedFields) : 'sin campos extraídos'}</p>
              <p>Warnings: {inspection.warnings?.length ? inspection.warnings.join(', ') : 'ninguno'}</p>
              {inspection.error && <p>Error: {inspection.error}</p>}
              <p>Texto:</p>
              <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 180, overflow: 'auto' }}>{inspection.text || '[vacío]'}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
