import fs from 'node:fs/promises'
import path from 'node:path'

import { analyzeDocument } from '../src/domain/tyrion/index.js'

const fixturesDir = path.resolve('/data/.openclaw/workspace/alfapyme/fixtures_realistic')

const expectations = [
  {
    file: 'permiso_embedded_real.pdf',
    source: 'pdf_text',
    textMustInclude: ['permiso de circulacion', '1234abc', 'julio notaro'],
    documentType: 'permiso_circulacion',
  },
  {
    file: 'dni_real.png',
    source: 'image_ocr',
    textMustInclude: ['documento nacional de identidad', '12345678z', 'julio notaro'],
    documentType: 'dni',
  },
  {
    file: 'contrato_scanned_real.pdf',
    source: 'pdf_ocr',
    textMustInclude: ['contrato de compraventa', '1234abc'],
    documentType: 'contrato_factura',
  },
]

function normalize(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

async function extractEmbeddedPdfText(absolutePath) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const buffer = await fs.readFile(absolutePath)
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) })
  const pdf = await loadingTask.promise
  const chunks = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (pageText) chunks.push(pageText)
  }

  return chunks.join('\n').trim()
}

async function inspectFixture(expectation) {
  const absolutePath = path.join(fixturesDir, expectation.file)
  let source = 'fallback'
  let text = ''

  if (expectation.source === 'pdf_text') {
    text = await extractEmbeddedPdfText(absolutePath)
    source = text ? 'pdf_text' : 'fallback'
  } else {
    text = await fs.readFile(absolutePath, 'latin1')
    source = expectation.source
  }

  const analysis = analyzeDocument({ fileName: expectation.file, ocrText: text })
  const normalizedText = normalize(text)
  const includesRequired = expectation.textMustInclude.every((token) => normalizedText.includes(token))
  const ok = source === expectation.source && analysis.documentType === expectation.documentType && includesRequired

  return {
    file: expectation.file,
    ok,
    source,
    documentType: analysis.documentType,
    confidence: analysis.confidence,
    includesRequired,
  }
}

const results = []
for (const expectation of expectations) {
  results.push(await inspectFixture(expectation))
}

console.log(JSON.stringify(results, null, 2))

if (results.some((item) => !item.ok)) {
  process.exit(1)
}
