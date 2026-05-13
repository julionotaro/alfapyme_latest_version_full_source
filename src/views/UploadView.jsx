import { useState } from 'react'
import { UploadCloud } from 'lucide-react'

export function UploadView({ selected, cases, setSelected, onUploadFiles }) {
  const [isOver, setIsOver] = useState(false)
  const [files, setFiles] = useState([])

  return (
    <div className="card upload">
      <h3>Subida múltiple documental</h3>

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
          <button className="primary" onClick={() => onUploadFiles(files)}>
            Subir archivos
          </button>
        </div>
      )}
    </div>
  )
}
