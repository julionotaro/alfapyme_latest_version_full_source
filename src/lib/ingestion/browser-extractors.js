const OCR_LANG = 'spa+eng'
const MAX_PDF_PAGES = 3

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

export async function extractEmbeddedPdfText(file) {
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

  return {
    text: textChunks.join('\n').trim(),
    pageCount: pdf.numPages,
    pagesProcessed: pages,
  }
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

function preprocessCanvas(canvas) {
  const context = canvas.getContext('2d', { willReadFrequently: true })
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
    const value = gray > 185 ? 255 : 0
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
  }

  context.putImageData(imageData, 0, 0)
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
  const viewport = page.getViewport({ scale: 2.4 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })

  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({ canvasContext: context, viewport }).promise
  preprocessCanvas(canvas)
  return canvas.toDataURL('image/png')
}

async function preprocessImageDataUrl(dataUrl) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo cargar la imagen para OCR'))
    img.src = dataUrl
  })

  const canvas = document.createElement('canvas')
  const scale = 2
  canvas.width = image.width * scale
  canvas.height = image.height * scale
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  preprocessCanvas(canvas)
  return canvas.toDataURL('image/png')
}

export async function extractPdfTextWithOcr(file) {
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

  return {
    text: chunks.join('\n').trim(),
    pageCount: pdf.numPages,
    pagesProcessed: pages,
  }
}

export async function extractImageText(file) {
  const originalDataUrl = await fileToDataUrl(file)
  const dataUrl = await preprocessImageDataUrl(originalDataUrl)
  const text = await runOcrFromDataUrl(dataUrl)

  return {
    text,
    pageCount: 1,
    pagesProcessed: 1,
  }
}

export async function extractTextFile(file) {
  return {
    text: await readTextFile(file),
    pageCount: 1,
    pagesProcessed: 1,
  }
}
