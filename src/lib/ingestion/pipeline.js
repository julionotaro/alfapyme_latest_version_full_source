import { analyzeDocument } from '../../domain/tyrion/index.js'
import { detectDocumentKind } from './file-kinds.js'

function buildEmptyResult(file, overrides = {}) {
  return {
    fileName: file?.name || '',
    fileType: file?.type || 'application/octet-stream',
    documentKind: detectDocumentKind(file),
    text: '',
    source: 'none',
    pageCount: 0,
    pagesProcessed: 0,
    confidenceHint: null,
    warnings: [],
    error: null,
    analysis: null,
    ...overrides,
  }
}

export async function runIngestionPipeline(file, adapters) {
  if (!file) return buildEmptyResult(file)

  const baseResult = buildEmptyResult(file)
  const kind = baseResult.documentKind

  try {
    if (kind === 'text') {
      const extraction = await adapters.extractTextFile(file)
      return finalizeResult(baseResult, {
        ...extraction,
        source: extraction.text ? 'text' : 'fallback',
      })
    }

    if (kind === 'pdf') {
      const embedded = await adapters.extractEmbeddedPdfText(file)
      if (embedded.text) {
        return finalizeResult(baseResult, {
          ...embedded,
          source: 'pdf_text',
        })
      }

      const ocr = await adapters.extractPdfTextWithOcr(file)
      if (ocr.text) {
        return finalizeResult(baseResult, {
          ...ocr,
          source: 'pdf_ocr',
          warnings: ['ocr_fallback_used'],
        })
      }

      return finalizeResult(baseResult, {
        ...ocr,
        source: 'fallback',
        warnings: ['empty_pdf_text'],
      })
    }

    if (kind === 'image') {
      const extraction = await adapters.extractImageText(file)
      return finalizeResult(baseResult, {
        ...extraction,
        source: extraction.text ? 'image_ocr' : 'fallback',
        warnings: extraction.text ? [] : ['empty_image_text'],
      })
    }

    return finalizeResult(baseResult, {
      source: 'fallback',
      warnings: ['unsupported_document_kind'],
    })
  } catch (error) {
    return finalizeResult(baseResult, {
      source: 'fallback',
      error: error?.message || String(error),
      warnings: ['ingestion_failed'],
    })
  }
}

function finalizeResult(baseResult, extraction) {
  const text = extraction.text?.trim() || ''
  const analysis = text
    ? analyzeDocument({ fileName: baseResult.fileName, ocrText: text })
    : null

  return {
    ...baseResult,
    ...extraction,
    text,
    analysis,
  }
}
