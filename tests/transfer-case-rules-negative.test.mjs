import { analyzeDocument, evaluateTransferCrossChecks } from '../src/domain/tyrion/index.js'

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

const inconsistentStandard = [
  makeDoc('cti_bad.pdf', `
    CTI - CAMBIO DE TITULARIDAD COMPLETO
    Adquirente: CRISTINA DOMINGUEZ GUNDIN
    DNI: 39462002M
    Transmitente: ALBERTO FRANCO ALFAYA
    Matricula 1007FZL
  `),
  makeDoc('modelo620_bad.pdf', `
    Modelo 620
    Impuesto sobre Transmisiones Patrimoniales
    Adquirente: CRISTINA DOMINGUEZ GUNDIN
    DNI: 11111111H
    Transmitente: ALBERTO FRANCO ALFAYA
    Matricula 9999ZZZ
  `),
]

const inconsistentSuccession = [
  makeDoc('cti_herencia_bad.pdf', `
    CTI - CAMBIO DE TITULARIDAD COMPLETO HERENCIA
    Adquirente: MARIA DEL CARMEN CARBALLAL LORES
    DNI: 35306584C
    Transmitente: JOSE MANUEL GONZALEZ FERNANDEZ
    Matricula 5042HZM
  `),
  makeDoc('certificado_bad.pdf', `
    Certificacion literal de inscripcion de defuncion
    Fallecido: PEDRO GARCIA LOPEZ
    DNI: 14958703T
    Fecha de defuncion 09/01/2026
  `),
  makeDoc('solicitud_bad.pdf', `
    Declaracion responsable para la solicitud del cambio de titularidad de un vehiculo por fallecimiento de su titular
    Solicitante: ANA PEREZ DIAZ
    DNI: 35306584C
    Matricula 5042HZM
  `),
  makeDoc('modelo650_ok.pdf', `
    Modelo 650
    Impuesto sobre Sucesiones y Donaciones
    Causante: JOSE MANUEL GONZALEZ FERNANDEZ
    Heredero: MARIA DEL CARMEN CARBALLAL LORES
  `),
]

const standardResult = evaluateTransferCrossChecks(inconsistentStandard)
const successionResult = evaluateTransferCrossChecks(inconsistentSuccession)

const assertions = [
  {
    name: 'standard detects blocking mismatches',
    ok: standardResult.blockingIssues.length >= 2,
    detail: standardResult.blockingIssues,
  },
  {
    name: 'succession detects blocking mismatches',
    ok: successionResult.blockingIssues.some((item) => ['heir_identity_match', 'deceased_identity_match'].includes(item.code)),
    detail: successionResult.blockingIssues,
  },
]

console.log(JSON.stringify(assertions, null, 2))
if (assertions.some((item) => !item.ok)) process.exit(1)
