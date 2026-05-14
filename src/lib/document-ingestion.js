const TEXT_LIKE_EXTENSIONS = ['txt', 'md', 'csv', 'json']
const IMAGE_MIME_PREFIX = 'image/'
const PDF_MIME = 'application/pdf'
const OCR_LANG = 'spa'
const MAX_PDF_PAGES = 3

function getExtension(file) {
  return String(file?.name || '').split('.').pop()?.toLowerCase() || ''
}

function isTextLike(file) {
  return TEXT_LIKE_EXTENSIONS.includes(getExtension(file))
}

function isPdf(file) {
  return file?.type === PDF_MIME || getExtension(file) === 'pdf'
}

function isImage(file) {
  return String(file?.type || '').startsWith(IMAGE_MIME_PREFIX)
}

async function readTextFile(file) {
  const text = await file.text()
  return text?.trim() ? text : ''
}

async function getPdfModule() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString()
  }
  return pdfjs
}

async function extractEmbeddedPdfText(file) {
  const pdfjs = await getPdfModule()
  const buffer = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data: buffer })
  const pdf = await loadingTask.promise
  const pages = Math.min(pdf.numPages, MAX_PDF_PAGES)
  const textChunks = []

  for (let pageNumber = 1; pageNumber <= pages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (pageText) textChunks.push(pageText)
  }

  return textChunks.join('\n').trim()
}

async function runOcrFromDataUrl(dataUrl) {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker(OCR_LANG)

  try {
    const result = await worker.recognize(dataUrl)
    return result?.data?.text?.trim() || ''
  } finally {
    await worker.terminate()
  }
}

async function fileToDataUrl(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('No se pudo leer el fichero'))
    reader.readAsDataURL(file)
  })
}

async function renderPdfPageToDataUrl(page) {
  const viewport = page.getViewport({ scale: 1.5 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })

  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({ canvasContext: context, viewport }).promise
  return canvas.toDataURL('image/png')
}

async function extractPdfTextWithOcr(file) {
  const pdfjs = await getPdfModule()
  const buffer = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data: buffer })
  const pdf = await loadingTask.promise
  const pages = Math.min(pdf.numPages, MAX_PDF_PAGES)
  const chunks = []

  for (let pageNumber = 1; pageNumber <= pages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const dataUrl = await renderPdfPageToDataUrl(page)
    const text = await runOcrFromDataUrl(dataUrl)
    if (text) chunks.push(text)
  }

  return chunks.join('\n').trim()
}

async function extractImageText(file) {
  const dataUrl = await fileToDataUrl(file)
  return runOcrFromDataUrl(dataUrl)
}

export async function extractDocumentText(file) {
  if (!file) return { text: '', source: 'none' }

  try {
    if (isTextLike(file)) {
      const text = await readTextFile(file)
      if (text) return { text, source: 'text' }
    }

    if (isPdf(file)) {
      const embeddedText = await extractEmbeddedPdfText(file)
      if (embeddedText) return { text: embeddedText, source: 'pdf_text' }

      const ocrText = await extractPdfTextWithOcr(file)
      if (ocrText) return { text: ocrText, source: 'pdf_ocr' }
    }

    if (isImage(file)) {
      const text = await extractImageText(file)
      if (text) return { text, source: 'image_ocr' }
    }
  } catch (error) {
    console.warn('document_ingestion_failed', {
      fileName: file?.name,
      fileType: file?.type,
      error: error?.message || String(error),
    })
  }

  return { text: '', source: 'fallback' }
}
