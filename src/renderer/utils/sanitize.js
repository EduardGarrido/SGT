import DOMPurify from 'dompurify'

export function sanitize(val) {
  return DOMPurify.sanitize((val ?? '').trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}
