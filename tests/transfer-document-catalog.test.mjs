import { analyzeDocument } from '../src/domain/tyrion/index.js'

const cases = [
  {
    label: 'modelo_620_transferencia',
    fileName: 'modelo620.jpg',
    text: `
      Agencia Tributaria
      Modelo 620
      Impuesto sobre Transmisiones Patrimoniales
      Transmitente: Luis Gomez
      Adquirente: Ana Perez
      Matrícula 1234ABC
      Valor declarado 12500,00
    `,
    expectedType: 'modelo_620',
    expectedCanonical: 'justificante_pago',
    expectedHints: ['transferencia'],
  },
  {
    label: 'tasa_dgt_1_5_transferencia',
    fileName: 'tasa15.pdf',
    text: `
      Ministerio del Interior
      Dirección General de Tráfico
      Tasa 1.5
      Cambio de titularidad
      Número de tasa 99887766
      NRC 1234567890
    `,
    expectedType: 'tasa_dgt_1_5',
    expectedCanonical: 'justificante_pago',
    expectedHints: ['transferencia'],
  },
  {
    label: 'ficha_tecnica_real',
    fileName: 'ficha.jpg',
    text: `
      Tarjeta ITV
      Ficha técnica
      Matrícula 1234ABC
      Bastidor WVGZZZ1JZXW000001
      Marca Volkswagen
      Modelo Golf
    `,
    expectedType: 'ficha_tecnica',
    expectedCanonical: 'ficha_tecnica',
    expectedHints: [],
  },
]

const results = cases.map((item) => {
  const analysis = analyzeDocument({ fileName: item.fileName, ocrText: item.text })
  const ok =
    analysis.documentType === item.expectedType &&
    analysis.canonicalType === item.expectedCanonical &&
    item.expectedHints.every((hint) => analysis.tramiteHints.includes(hint))

  return {
    label: item.label,
    ok,
    documentType: analysis.documentType,
    canonicalType: analysis.canonicalType,
    tramiteHints: analysis.tramiteHints,
    confidence: analysis.confidence,
  }
})

console.log(JSON.stringify(results, null, 2))

if (results.some((item) => !item.ok)) process.exit(1)
