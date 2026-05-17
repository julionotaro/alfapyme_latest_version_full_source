import { DOCUMENT_TYPES } from './document-types.js'

const TYPE_RULES = [
  {
    type: DOCUMENT_TYPES.PERMISO_CIRCULACION,
    keywords: ['permiso circulacion', 'permiso de circulacion', 'circulation permit'],
    strongSignals: ['matricula', 'bastidor', 'titular'],
  },
  {
    type: DOCUMENT_TYPES.FICHA_TECNICA,
    keywords: ['ficha tecnica', 'tarjeta itv', 'itv', 'technical sheet'],
    strongSignals: ['matricula', 'bastidor', 'marca', 'modelo'],
  },
  {
    type: DOCUMENT_TYPES.CONTRATO_FACTURA,
    keywords: ['contrato', 'factura', 'compraventa', 'venta vehiculo'],
    strongSignals: ['comprador', 'vendedor', 'matricula', 'precio'],
  },
  {
    type: DOCUMENT_TYPES.JUSTIFICANTE_PAGO,
    keywords: ['justificante', 'tasa', 'modelo 620', 'modelo 621', 'pago', 'abonado'],
    strongSignals: ['importe', 'fecha', 'referencia'],
  },
  {
    type: DOCUMENT_TYPES.DNI_COMPRADOR,
    keywords: ['dni comprador', 'doc comprador', 'identidad comprador'],
    strongSignals: ['dni', 'comprador'],
  },
  {
    type: DOCUMENT_TYPES.DNI_VENDEDOR,
    keywords: ['dni vendedor', 'doc vendedor', 'identidad vendedor'],
    strongSignals: ['dni', 'vendedor'],
  },
  {
    type: DOCUMENT_TYPES.DNI,
    keywords: ['dni', 'documento nacional identidad', 'nie', 'pasaporte'],
    strongSignals: ['dni', 'nombre'],
  },
  {
    type: DOCUMENT_TYPES.MANDATO_GESTORIA,
    keywords: ['mandato', 'autorizacion', 'autorización', 'gestoria'],
    strongSignals: ['autorizo', 'tramite', 'firma'],
  },
  {
    type: DOCUMENT_TYPES.JUSTIFICANTE_DOMICILIO,
    keywords: ['empadronamiento', 'domicilio', 'recibo', 'suministro'],
    strongSignals: ['direccion', 'domicilio'],
  },
  {
    type: DOCUMENT_TYPES.DECLARACION_EXTRAVIO,
    keywords: ['extravio', 'extravío', 'perdida documentacion'],
    strongSignals: ['declaro', 'extrav'],
  },
  {
    type: DOCUMENT_TYPES.CERTIFICADO_CAT,
    keywords: ['certificado cat', 'centro autorizado', 'desguace'],
    strongSignals: ['vehiculo', 'baja definitiva'],
  },
  {
    type: DOCUMENT_TYPES.COC_FICHA_REDUCIDA,
    keywords: ['coc', 'ficha reducida', 'certificado de conformidad'],
    strongSignals: ['homologacion', 'bastidor', 'marca', 'modelo'],
  },
  {
    type: DOCUMENT_TYPES.DUA,
    keywords: ['dua', 'documento unico administrativo', 'documento único administrativo', 'aduana'],
    strongSignals: ['importacion', 'importación', 'mrn'],
  },
  {
    type: DOCUMENT_TYPES.DOCUMENTACION_EXTRANJERA,
    keywords: ['fahrzeugbrief', 'registration certificate', 'foreign registration', 'documentacion extranjera'],
    strongSignals: ['country', 'matricula', 'bastidor'],
  },
  {
    type: DOCUMENT_TYPES.EMPADRONAMIENTO,
    keywords: ['empadronamiento', 'padron municipal', 'padrón municipal'],
    strongSignals: ['domicilio', 'municipio'],
  },
  {
    type: DOCUMENT_TYPES.SOLICITUD_DUPLICADO,
    keywords: ['duplicado'],
    strongSignals: ['solicitud'],
  },
  {
    type: DOCUMENT_TYPES.SOLICITUD_BAJA,
    keywords: ['solicitud baja', 'baja temporal', 'baja definitiva'],
    strongSignals: ['solicitud', 'baja'],
  },
]

function normalize(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function tokenize(value = '') {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function firstMatch(regex, text) {
  const match = text.match(regex)
  return match?.[1] || match?.[0] || null
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))]
}

const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE'

function computeDniLetter(numberText) {
  const numeric = String(numberText || '').replace(/\D/g, '')
  if (!/^\d{8}$/.test(numeric)) return null
  return DNI_LETTERS[Number(numeric) % 23]
}

function recoverDniCandidates(text) {
  const recovered = []
  const matches = [...text.matchAll(/(?:dni|nie|documento nacional identidad|dn)[:\s]*([0-9oilsbzg]{8,9})([a-z0-9]?)/gi)]

  for (const match of matches) {
    const raw = `${match[1] || ''}${match[2] || ''}`.toUpperCase().replace(/[^A-Z0-9]/g, '')
    const normalizedDigits = raw
      .replace(/[OQ]/g, '0')
      .replace(/[IL]/g, '1')
      .replace(/S/g, '5')
      .replace(/B/g, '8')
      .replace(/G/g, '6')
      .replace(/Z/g, '2')

    const numeric = normalizedDigits.replace(/[^0-9]/g, '')
    if (numeric.length >= 8) {
      const base = numeric.slice(0, 8)
      const letter = computeDniLetter(base)
      if (letter) recovered.push(`${base}${letter}`)
    }
  }

  return recovered
}

function normalizeOcrDigits(value = '') {
  return String(value)
    .toUpperCase()
    .replace(/[OQ]/g, '0')
    .replace(/[IL]/g, '1')
    .replace(/S/g, '5')
    .replace(/B/g, '8')
    .replace(/G/g, '6')
    .replace(/Z/g, '2')
}

function recoverPlateCandidates(text) {
  const recovered = []
  const matches = [...text.matchAll(/(?:matricula|matr[íi]cula)[:\s.-]*([0-9OQILSBZG]{4,5})\s*([A-Z]{3})/gi)]

  for (const match of matches) {
    let digits = normalizeOcrDigits(match[1]).replace(/\D/g, '')
    const letters = String(match[2] || '').replace(/[^A-Z]/g, '').toUpperCase()

    if (digits.length === 5 && digits[0] === digits[1]) {
      digits = digits.slice(1)
    }

    if (digits.length === 5) {
      digits = digits.slice(0, 4)
    }

    if (digits.length === 4 && letters.length === 3) {
      recovered.push(`${digits}${letters}`)
    }
  }

  return recovered
}

function extractFields(rawText) {
  const text = rawText || ''
  const normalized = normalize(text)

  const plateMatches = unique([
    ...[...normalized.matchAll(/\b([0-9]{4}[a-z]{3}|[a-z]{1,2}[- ]?[0-9]{4}[- ]?[a-z]{1,2})\b/g)].map(
      (match) => match[1].replace(/[^a-z0-9]/g, '').toUpperCase(),
    ),
    ...recoverPlateCandidates(text),
  ])
  const dniMatches = unique([
    ...[...normalized.matchAll(/\b([0-9]{7,8}[a-z]|[xyz][0-9]{7}[a-z])\b/g)].map((match) => match[1].toUpperCase()),
    ...recoverDniCandidates(text),
  ])
  const names = unique([
    firstMatch(/(?:comprador|buyer):\s*([^\n]{4,})/i, text)?.trim(),
    firstMatch(/(?:vendedor|seller):\s*([^\n]{4,})/i, text)?.trim(),
    firstMatch(/(?:titular):\s*([^\n]{4,})/i, text)?.trim(),
    firstMatch(/(?:nombre):\s*([^\n]{4,})/i, text)?.trim(),
  ])
  const buyerName = firstMatch(/(?:comprador|buyer):\s*([^\n]{4,})/i, text)?.trim() || null
  const sellerName = firstMatch(/(?:vendedor|seller):\s*([^\n]{4,})/i, text)?.trim() || null
  const ownerName = firstMatch(/(?:titular):\s*([^\n]{4,})/i, text)?.trim() || null
  const amount = firstMatch(/(?:importe|precio|total)[:\s€]*([0-9]+(?:[.,][0-9]{2})?)/i, text)
  const date = firstMatch(/\b([0-3]?\d[\/.-][0-1]?\d[\/.-](?:20)?\d{2})\b/, text)
  const address = firstMatch(/(?:domicilio|direccion|dirección)[:\s]+([^\n,]{5,})/i, text)?.trim() || null
  const vin = firstMatch(/\b([a-hj-npr-z0-9]{17})\b/i, normalized)?.toUpperCase() || null

  return {
    plates: unique(plateMatches),
    dniList: unique(dniMatches),
    names,
    buyerName,
    sellerName,
    ownerName,
    amount: amount ? amount.replace(',', '.') : null,
    date,
    address,
    vin,
  }
}

function scoreRule(rule, text) {
  let score = 0
  for (const keyword of rule.keywords) {
    if (text.includes(normalize(keyword))) score += 3
  }
  for (const signal of rule.strongSignals || []) {
    if (text.includes(normalize(signal))) score += 1
  }
  return score
}

function inferRole(type, normalizedText) {
  if (type === DOCUMENT_TYPES.DNI) {
    if (normalizedText.includes('comprador')) return DOCUMENT_TYPES.DNI_COMPRADOR
    if (normalizedText.includes('vendedor')) return DOCUMENT_TYPES.DNI_VENDEDOR
  }

  return type
}

export function analyzeDocument({ fileName = '', ocrText = '' }) {
  const rawText = `${fileName}\n${ocrText}`
  const normalizedText = tokenize(rawText)
  const extractedFields = extractFields(rawText)

  let bestType = DOCUMENT_TYPES.DOCUMENTO_TRAFICO
  let bestScore = 0

  for (const rule of TYPE_RULES) {
    const score = scoreRule(rule, normalizedText)
    if (score > bestScore) {
      bestScore = score
      bestType = inferRole(rule.type, normalizedText)
    }
  }

  if (bestType === DOCUMENT_TYPES.DOCUMENTO_TRAFICO && extractedFields.dniList.length > 0) {
    bestType = inferRole(DOCUMENT_TYPES.DNI, normalizedText)
    bestScore = 2
  }

  if (bestType === DOCUMENT_TYPES.DOCUMENTO_TRAFICO && extractedFields.plates.length > 0) {
    bestScore = 2
  }

  const confidence = Math.max(0.55, Math.min(0.97, 0.55 + bestScore * 0.06 + (extractedFields.plates.length > 0 ? 0.06 : 0)))

  return {
    documentType: bestType,
    confidence: Number(confidence.toFixed(2)),
    extractedFields,
    normalizedText,
  }
}

export function buildSimulatedOcrText(file) {
  const name = String(file?.name || '').replace(/[_-]+/g, ' ')
  return `Documento cargado: ${name}`
}
