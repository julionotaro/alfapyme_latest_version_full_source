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
    reasons.push(`La IA no pudo clasificar este documento con suficiente seguridad (conf. ${confidence.toFixed(2)} de 0.85 mínimo).`)
  }

  if (ingestionError) {
    reasons.push(`La ingesta devolvió error: ${ingestionError}.`)
  }

  if (warnings.length) {
    warnings.slice(0, 3).forEach((warning) => {
      if (warning === 'ocr_fallback_used') {
        reasons.push('El lector principal no extrajo bien el texto y el sistema tuvo que recurrir a un OCR alternativo; eso reduce la fiabilidad de la lectura.')
        return
      }
      reasons.push(`La ingesta devolvió una advertencia técnica: ${warning}.`)
    })
  }

  if (ocrText.length > 0 && ocrText.length < 80) {
    reasons.push('Se recuperó muy poco texto útil del documento, así que la clasificación salió con base débil.')
  }

  if (!ocrText.length) {
    reasons.push('No se pudo recuperar texto utilizable del documento.')
  }

  if (signals === 0) {
    reasons.push('La IA no encontró campos clave claros para apoyar la lectura del documento.')
  } else if (signals <= 1) {
    reasons.push('Se detectaron muy pocas señales útiles para clasificar y contrastar el documento.')
  }

  if (normalizedType === 'documento_trafico') {
    reasons.push('La IA no pudo concretar bien el tipo documental y lo dejó en una categoría demasiado genérica.')
  }

  return [...new Set(reasons)]
}

export function getDocumentConfidenceSummary(document) {
  const reasons = getDocumentConfidenceReasons(document)
  if (!reasons.length) return 'Sin alertas visibles de confianza.'
  return reasons[0]
}
