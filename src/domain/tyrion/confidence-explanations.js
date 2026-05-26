function countExtractedSignals(fields = {}) {
  let score = 0
  if ((fields.plates || []).length) score += 1
  if (fields.vin) score += 1
  if (fields.buyerName) score += 1
  if (fields.sellerName) score += 1
  if (fields.ownerName) score += 1
  if (fields.heirName) score += 1
  if (fields.deceasedName) score += 1
  if ((fields.names || []).length) score += 1
  if ((fields.dniList || []).length) score += 1
  if ((fields.formCodes || []).length) score += 1
  if (fields.address) score += 1
  return score
}

export function getDocumentConfidenceReasons(document) {
  if (!document) return []

  const reasons = []
  const confidence = Number(document.confidence ?? document.ai_payload?.confidence ?? 0)
  const fields = document.ai_payload?.extracted_fields || {}
  const warnings = document.ai_payload?.ingestion_warnings || []
  const ingestionError = document.ai_payload?.ingestion_error
  const ocrText = String(document.ocr_text || '').trim()
  const signals = countExtractedSignals(fields)
  const normalizedType = String(document.document_type || '')

  if (confidence > 0 && confidence < 0.85) {
    reasons.push(`La clasificación quedó por debajo del umbral operativo (conf. ${confidence.toFixed(2)} < 0.85).`)
  }

  if (ingestionError) {
    reasons.push(`La ingesta devolvió error: ${ingestionError}.`)
  }

  if (warnings.length) {
    warnings.slice(0, 3).forEach((warning) => reasons.push(`La ingesta avisó: ${warning}.`))
  }

  if (ocrText.length > 0 && ocrText.length < 80) {
    reasons.push('El OCR recuperó muy poco texto útil del documento.')
  }

  if (!ocrText.length) {
    reasons.push('No se recuperó texto OCR utilizable.')
  }

  if (signals === 0) {
    reasons.push('No se detectaron campos clave extraíbles en el documento.')
  } else if (signals <= 1) {
    reasons.push('Se detectaron muy pocas señales útiles para clasificar y contrastar el documento.')
  }

  if (normalizedType === 'documento_trafico') {
    reasons.push('La IA no pudo concretar mejor el tipo documental y lo dejó en una categoría demasiado genérica.')
  }

  return [...new Set(reasons)]
}

export function getDocumentConfidenceSummary(document) {
  const reasons = getDocumentConfidenceReasons(document)
  if (!reasons.length) return 'Sin alertas visibles de confianza.'
  return reasons[0]
}
