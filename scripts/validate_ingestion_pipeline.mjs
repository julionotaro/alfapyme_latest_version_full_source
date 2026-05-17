import { runIngestionPipeline } from '../src/lib/ingestion/pipeline.js'

function makeFile({ name, type }) {
  return { name, type }
}

const adapters = {
  async extractTextFile() {
    return { text: 'texto plano de prueba', pageCount: 1, pagesProcessed: 1 }
  },
  async extractEmbeddedPdfText(file) {
    if (file.name.includes('embedded')) {
      return {
        text: 'PERMISO DE CIRCULACION Matrícula 1234ABC Titular Julio Notaro',
        pageCount: 1,
        pagesProcessed: 1,
      }
    }

    return { text: '', pageCount: 1, pagesProcessed: 1 }
  },
  async extractPdfTextWithOcr(file) {
    if (file.name.includes('scanned')) {
      return {
        text: 'CONTRATO DE COMPRAVENTA Comprador Ana Perez Vendedor Luis Gomez Matrícula 1234ABC',
        pageCount: 2,
        pagesProcessed: 2,
      }
    }

    return { text: '', pageCount: 1, pagesProcessed: 1 }
  },
  async extractImageText() {
    return {
      text: 'DNI 12345678Z JULIO NOTARO',
      pageCount: 1,
      pagesProcessed: 1,
    }
  },
}

const cases = [
  {
    label: 'pdf_text_embedded',
    file: makeFile({ name: 'permiso_embedded.pdf', type: 'application/pdf' }),
    expectedSource: 'pdf_text',
  },
  {
    label: 'pdf_scanned_fallback_ocr',
    file: makeFile({ name: 'contrato_scanned.pdf', type: 'application/pdf' }),
    expectedSource: 'pdf_ocr',
  },
  {
    label: 'image_ocr',
    file: makeFile({ name: 'dni.png', type: 'image/png' }),
    expectedSource: 'image_ocr',
  },
]

const results = []

for (const item of cases) {
  const result = await runIngestionPipeline(item.file, adapters)
  results.push({
    label: item.label,
    ok: result.source === item.expectedSource && Boolean(result.analysis?.documentType),
    source: result.source,
    documentType: result.analysis?.documentType || null,
    warnings: result.warnings,
  })
}

console.log(JSON.stringify(results, null, 2))

if (results.some((item) => !item.ok)) {
  process.exit(1)
}
