function clean(value) {
  return String(value || '').trim()
}

function normalize(value) {
  return clean(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function unique(values = []) {
  return [...new Set(values.map(clean).filter(Boolean))]
}

function collectFieldCandidates(documents = [], fieldKey, projector = null) {
  return documents.flatMap((document) => {
    const fields = document?.ai_payload?.extracted_fields || {}
    const raw = projector ? projector(fields, document) : fields[fieldKey]
    const values = Array.isArray(raw) ? raw : raw ? [raw] : []
    return values.map((value) => ({
      fieldKey,
      value: clean(value),
      normalizedValue: normalize(value),
      documentId: document.id,
      fileName: document.file_name,
      confidence: Number(document.confidence ?? 0),
      documentType: document.document_type,
    })).filter((item) => item.value)
  })
}

function resolveCanonicalField(candidates = []) {
  const filtered = candidates.filter((item) => item.normalizedValue)
  if (!filtered.length) {
    return {
      value: null,
      status: 'missing',
      candidates: [],
      sources: [],
    }
  }

  const grouped = new Map()
  for (const candidate of filtered) {
    const key = candidate.normalizedValue
    const current = grouped.get(key) || { score: 0, representative: candidate, sources: [] }
    current.score += Math.max(0.5, candidate.confidence || 0.5)
    current.sources.push(candidate)
    if ((candidate.confidence || 0) > (current.representative.confidence || 0)) current.representative = candidate
    grouped.set(key, current)
  }

  const ranked = [...grouped.values()].sort((a, b) => b.score - a.score)
  const winner = ranked[0]

  return {
    value: winner?.representative?.value || null,
    status: ranked.length > 1 ? 'conflict' : 'confirmed',
    candidates: ranked.map((item) => item.representative.value),
    sources: winner?.sources || [],
  }
}

export function buildCaseCanonicalData(documents = []) {
  const fields = {
    plate: resolveCanonicalField(collectFieldCandidates(documents, 'plates', (f) => f.plates || [])),
    vin: resolveCanonicalField(collectFieldCandidates(documents, 'vin')),
    buyerName: resolveCanonicalField(collectFieldCandidates(documents, 'buyerName')),
    buyerId: resolveCanonicalField(collectFieldCandidates(documents, 'buyerId')),
    sellerName: resolveCanonicalField(collectFieldCandidates(documents, 'sellerName')),
    sellerId: resolveCanonicalField(collectFieldCandidates(documents, 'sellerId')),
    ownerName: resolveCanonicalField(collectFieldCandidates(documents, 'ownerName')),
    heirName: resolveCanonicalField(collectFieldCandidates(documents, 'heirName')),
    deceasedName: resolveCanonicalField(collectFieldCandidates(documents, 'deceasedName')),
    caseReference: resolveCanonicalField(collectFieldCandidates(documents, 'caseReference')),
    feeReference: resolveCanonicalField(collectFieldCandidates(documents, 'feeReference')),
    filingDate: resolveCanonicalField(collectFieldCandidates(documents, 'date')),
    signatureDate: resolveCanonicalField(collectFieldCandidates(documents, 'signatureDate')),
  }

  const conflicts = Object.entries(fields)
    .filter(([, value]) => value.status === 'conflict')
    .map(([fieldKey, value]) => ({ fieldKey, ...value }))

  const missing = Object.entries(fields)
    .filter(([, value]) => value.status === 'missing')
    .map(([fieldKey]) => fieldKey)

  return {
    fields,
    conflicts,
    missing,
    completeness: Math.round((Object.values(fields).filter((item) => item.status !== 'missing').length / Object.keys(fields).length) * 100),
  }
}

export function buildExtractionRows(document) {
  const fields = document?.ai_payload?.extracted_fields || {}
  const base = {
    case_id: document.case_id,
    document_id: document.id,
    confidence: Number(document.confidence ?? 0),
  }

  const entries = [
    ['plate', fields.plates || []],
    ['vin', fields.vin ? [fields.vin] : []],
    ['buyer_name', fields.buyerName ? [fields.buyerName] : []],
    ['buyer_id', fields.buyerId ? [fields.buyerId] : []],
    ['seller_name', fields.sellerName ? [fields.sellerName] : []],
    ['seller_id', fields.sellerId ? [fields.sellerId] : []],
    ['owner_name', fields.ownerName ? [fields.ownerName] : []],
    ['heir_name', fields.heirName ? [fields.heirName] : []],
    ['deceased_name', fields.deceasedName ? [fields.deceasedName] : []],
    ['case_reference', fields.caseReference ? [fields.caseReference] : []],
    ['fee_reference', fields.feeReference ? [fields.feeReference] : []],
    ['filing_date', fields.date ? [fields.date] : []],
    ['signature_date', fields.signatureDate ? [fields.signatureDate] : []],
  ]

  return entries.flatMap(([fieldKey, values]) => unique(values).map((value) => ({
    ...base,
    field_key: fieldKey,
    field_value: value,
    normalized_value: normalize(value),
    metadata: {
      file_name: document.file_name,
      document_type: document.document_type,
    },
  })))
}
