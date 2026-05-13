import { DOCUMENT_TYPES } from './document-types'

export function detectMockDocumentType(name = '') {
  const normalized = name.toLowerCase()

  if (normalized.includes('dni') && normalized.includes('compr')) return DOCUMENT_TYPES.DNI_COMPRADOR
  if (normalized.includes('dni') && normalized.includes('vend')) return DOCUMENT_TYPES.DNI_VENDEDOR
  if (normalized.includes('dni')) return DOCUMENT_TYPES.DNI
  if (normalized.includes('permiso')) return DOCUMENT_TYPES.PERMISO_CIRCULACION
  if (normalized.includes('ficha')) return DOCUMENT_TYPES.FICHA_TECNICA
  if (normalized.includes('factura') || normalized.includes('contrato')) return DOCUMENT_TYPES.CONTRATO_FACTURA
  if (normalized.includes('pago') || normalized.includes('tasa') || normalized.includes('justificante')) {
    return DOCUMENT_TYPES.JUSTIFICANTE_PAGO
  }
  if (normalized.includes('mandato') || normalized.includes('autorizacion')) return DOCUMENT_TYPES.MANDATO_GESTORIA
  if (normalized.includes('extravio')) return DOCUMENT_TYPES.DECLARACION_EXTRAVIO
  if (normalized.includes('cat')) return DOCUMENT_TYPES.CERTIFICADO_CAT
  if (normalized.includes('export')) return DOCUMENT_TYPES.DOCUMENTACION_EXPORTACION
  if (normalized.includes('extranj')) return DOCUMENT_TYPES.DOCUMENTACION_EXTRANJERA
  if (normalized.includes('coc') || normalized.includes('reducida')) return DOCUMENT_TYPES.COC_FICHA_REDUCIDA
  if (normalized.includes('dua')) return DOCUMENT_TYPES.DUA
  if (normalized.includes('empadron')) return DOCUMENT_TYPES.EMPADRONAMIENTO
  if (normalized.includes('foto')) return DOCUMENT_TYPES.FOTO
  if (normalized.includes('domicilio')) return DOCUMENT_TYPES.JUSTIFICANTE_DOMICILIO
  if (normalized.includes('solicitud') && normalized.includes('baja')) return DOCUMENT_TYPES.SOLICITUD_BAJA
  if (normalized.includes('duplicado')) return DOCUMENT_TYPES.SOLICITUD_DUPLICADO

  return DOCUMENT_TYPES.DOCUMENTO_TRAFICO
}
