const TEXT_LIKE_EXTENSIONS = ['txt', 'md', 'csv', 'json']
const IMAGE_MIME_PREFIX = 'image/'
const PDF_MIME = 'application/pdf'

export function getFileExtension(file) {
  return String(file?.name || '').split('.').pop()?.toLowerCase() || ''
}

export function isTextLikeFile(file) {
  return TEXT_LIKE_EXTENSIONS.includes(getFileExtension(file))
}

export function isPdfFile(file) {
  return file?.type === PDF_MIME || getFileExtension(file) === 'pdf'
}

export function isImageFile(file) {
  return String(file?.type || '').startsWith(IMAGE_MIME_PREFIX)
}

export function detectDocumentKind(file) {
  if (!file) return 'none'
  if (isTextLikeFile(file)) return 'text'
  if (isPdfFile(file)) return 'pdf'
  if (isImageFile(file)) return 'image'
  return 'unknown'
}
