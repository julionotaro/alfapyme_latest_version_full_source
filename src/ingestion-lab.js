import { inspectDocument } from './lib/document-ingestion.js'

const filesInput = document.getElementById('files')
const runButton = document.getElementById('run')
const output = document.getElementById('output')

runButton.addEventListener('click', async () => {
  const files = [...(filesInput.files || [])]

  if (files.length === 0) {
    output.textContent = 'Selecciona al menos un archivo.'
    return
  }

  output.textContent = 'Procesando...'
  const results = []

  for (const file of files) {
    const result = await inspectDocument(file)
    results.push({
      fileName: result.fileName,
      source: result.source,
      documentKind: result.documentKind,
      pageCount: result.pageCount,
      pagesProcessed: result.pagesProcessed,
      warnings: result.warnings,
      error: result.error,
      documentType: result.analysis?.documentType || null,
      confidence: result.analysis?.confidence || null,
      extractedFields: result.analysis?.extractedFields || {},
      textPreview: result.text?.slice(0, 600) || '',
    })
  }

  output.textContent = JSON.stringify(results, null, 2)
})
