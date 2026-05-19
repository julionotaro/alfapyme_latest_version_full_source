import {
  analyzeDocument,
  evaluateTransferCrossChecks,
  inferTransferCaseSubtype,
  TRANSFER_CASE_SUBTYPES,
} from '../src/domain/tyrion/index.js'

function makeDoc(fileName, text) {
  const analysis = analyzeDocument({ fileName, ocrText: text })
  return {
    document_type: analysis.documentType,
    ai_payload: {
      extracted_fields: analysis.extractedFields,
      normalized_text: analysis.normalizedText,
    },
  }
}

const standardDocs = [
  makeDoc(
    'cti_cristina.pdf',
    `
    CTI - CAMBIO DE TITULARIDAD COMPLETO
    Adquirente: CRISTINA DOMINGUEZ GUNDIN
    DNI: 39462002M
    Transmitente: ALBERTO FRANCO ALFAYA
    Matricula 1007FZL
    Bastidor 5HD1PR8469Y52968
    Fecha Presentacion 13/05/2026
  `,
  ),
  makeDoc(
    'modelo620_cristina.pdf',
    `
    Modelo 620
    Impuesto sobre Transmisiones Patrimoniales
    Adquirente: CRISTINA DOMINGUEZ GUNDIN
    DNI: 39462002M
    Transmitente: ALBERTO FRANCO ALFAYA
    Matricula 1007FZL
    Bastidor 5HD1PR8469Y52968
    Valor declarado 1550,00
  `,
  ),
]

const successionDocs = [
  makeDoc(
    'cti_herencia_maria.pdf',
    `
    CTI - CAMBIO DE TITULARIDAD COMPLETO HERENCIA
    Adquirente: MARIA DEL CARMEN CARBALLAL LORES
    DNI: 35306584C
    Transmitente: JOSE MANUEL GONZALEZ FERNANDEZ
    Matricula 5042HZM
    Fecha Presentacion 13/05/2026
  `,
  ),
  makeDoc(
    'modelo650_maria.pdf',
    `
    Modelo 650
    Impuesto sobre Sucesiones y Donaciones
    Causante: JOSE MANUEL GONZALEZ FERNANDEZ
    Heredero: MARIA DEL CARMEN CARBALLAL LORES
  `,
  ),
  makeDoc(
    'solicitud_fallecimiento_maria.pdf',
    `
    Declaracion responsable para la solicitud del cambio de titularidad de un vehiculo por fallecimiento de su titular
    Solicitante: MARIA DEL CARMEN CARBALLAL LORES
    DNI: 35306584C
    Matricula 5042HZM
  `,
  ),
  makeDoc(
    'certificado_defuncion_maria.pdf',
    `
    Certificacion literal de inscripcion de defuncion
    Fallecido: JOSE MANUEL GONZALEZ FERNANDEZ
    DNI: 14958703T
    Fecha de defuncion 09/01/2026
  `,
  ),
]

const standardSubtype = inferTransferCaseSubtype(standardDocs)
const successionSubtype = inferTransferCaseSubtype(successionDocs)
const standardEvaluation = evaluateTransferCrossChecks(standardDocs)
const successionEvaluation = evaluateTransferCrossChecks(successionDocs)

const assertions = [
  {
    name: 'standard subtype inferred',
    ok: standardSubtype.subtype === TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_ESTANDAR,
    detail: standardSubtype,
  },
  {
    name: 'succession subtype inferred',
    ok: successionSubtype.subtype === TRANSFER_CASE_SUBTYPES.TRANSFERENCIA_SUCESION,
    detail: successionSubtype,
  },
  {
    name: 'standard no blocking issues',
    ok: standardEvaluation.blockingIssues.length === 0,
    detail: standardEvaluation.blockingIssues,
  },
  {
    name: 'succession no blocking issues',
    ok: successionEvaluation.blockingIssues.length === 0,
    detail: successionEvaluation.blockingIssues,
  },
  {
    name: 'standard buyer id extracted',
    ok: standardDocs[0].ai_payload.extracted_fields.buyerId === '39462002M',
    detail: standardDocs[0].ai_payload.extracted_fields,
  },
  {
    name: 'succession deceased date extracted',
    ok: successionDocs[3].ai_payload.extracted_fields.deathDate === '09/01/2026',
    detail: successionDocs[3].ai_payload.extracted_fields,
  },
]

console.log(JSON.stringify(assertions, null, 2))

if (assertions.some((item) => !item.ok)) process.exit(1)
