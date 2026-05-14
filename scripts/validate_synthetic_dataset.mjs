import fs from 'node:fs/promises'
import path from 'node:path'
import { analyzeDocument, evaluateExpedient } from '../src/domain/tyrion/index.js'

const datasetDir = path.resolve('/data/.openclaw/workspace/alfapyme/synthetic-data')

const expectations = {
  transferencia_ok: {
    caseData: { case_type: 'transferencia' },
    requiredTypes: ['permiso_circulacion', 'ficha_tecnica', 'contrato_factura', 'dni_vendedor', 'dni_comprador', 'justificante_pago'],
    targetState: 'ready_for_output',
  },
  transferencia_inconsistente: {
    caseData: { case_type: 'transferencia' },
    requiredTypes: ['permiso_circulacion', 'ficha_tecnica', 'contrato_factura', 'dni_vendedor', 'dni_comprador', 'justificante_pago'],
    targetState: 'human_validation',
  },
  duplicado_ok: {
    caseData: { case_type: 'duplicado' },
    requiredTypes: ['dni', 'declaracion_extravio', 'justificante_pago'],
    targetState: 'ready_for_output',
  },
}

async function readCaseDocuments(caseSlug) {
  const dir = path.join(datasetDir, caseSlug)
  const entries = await fs.readdir(dir)
  const documents = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const text = await fs.readFile(fullPath, 'utf8')
    const analysis = analyzeDocument({ fileName: entry, ocrText: text })
    documents.push({
      id: `${caseSlug}:${entry}`,
      file_name: entry,
      document_type: analysis.documentType,
      confidence: analysis.confidence,
      ai_payload: {
        extracted_fields: analysis.extractedFields,
      },
    })
  }

  return documents
}

async function main() {
  const caseSlugs = Object.keys(expectations)
  const results = []

  for (const caseSlug of caseSlugs) {
    const expected = expectations[caseSlug]
    const documents = await readCaseDocuments(caseSlug)
    const assessment = evaluateExpedient({ caseData: expected.caseData, documents })
    const detectedTypes = documents.map((document) => document.document_type)
    const missingExpectedTypes = expected.requiredTypes.filter((type) => !detectedTypes.includes(type))

    const ok = missingExpectedTypes.length === 0 && assessment.decision.targetState === expected.targetState

    results.push({
      caseSlug,
      ok,
      targetState: assessment.decision.targetState,
      expectedTargetState: expected.targetState,
      missingExpectedTypes,
      failedCrossValidations: assessment.failedCrossValidations.map((item) => item.code),
    })
  }

  console.log(JSON.stringify(results, null, 2))

  if (results.some((result) => !result.ok)) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
