import {
  extractEmbeddedPdfText,
  extractImageText,
  extractPdfTextWithOcr,
  extractTextFile,
} from './ingestion/browser-extractors.js'
import { runIngestionPipeline } from './ingestion/pipeline.js'

const browserAdapters = {
  extractTextFile,
  extractEmbeddedPdfText,
  extractPdfTextWithOcr,
  extractImageText,
}

export async function inspectDocument(file) {
  const result = await runIngestionPipeline(file, browserAdapters)

  if (result.error) {
    console.warn('document_ingestion_failed', {
      fileName: file?.name,
      fileType: file?.type,
      error: result.error,
    })
  }

  return result
}

export async function extractDocumentText(file) {
  const result = await inspectDocument(file)
  return {
    text: result.text,
    source: result.source,
  }
}
