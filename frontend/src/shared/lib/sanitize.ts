// Санитайзинг пользовательского контента (#215/#239).
// sanitizeUrl — allowlist схем для ссылок (нужен ExternalLink и HTML-санитайзеру).

/** Схемы, которые разрешаем в ссылках. Всё остальное (javascript:/data:/vbscript:) режем. */
const SAFE_SCHEMES = ['http:', 'https:', 'mailto:']

/**
 * Убирает управляющие символы (коды 0x00–0x1F и 0x7F), которыми маскируют опасную схему
 * вида «java{TAB}script:». Браузер такие символы в URL игнорирует, поэтому режем их сами.
 */
function stripControlChars(value: string): string {
  let result = ''
  for (const char of value) {
    const code = char.charCodeAt(0)
    if (code > 0x1f && code !== 0x7f) {
      result += char
    }
  }
  return result
}

/**
 * Приводит URL к безопасному виду: возвращает исходную строку, если схема разрешена
 * (http/https/mailto) или URL относительный (/legal, #anchor), иначе — пустую строку.
 */
export function sanitizeUrl(rawUrl: unknown): string {
  if (typeof rawUrl !== 'string') return ''
  const cleaned = stripControlChars(rawUrl).trim()
  if (cleaned === '') return ''

  let protocol: string
  try {
    // base нужен только для относительных URL: они наследуют https: и проходят проверку,
    // а абсолютные со своей схемой (javascript:, data:) сохраняют её и будут отклонены
    protocol = new URL(cleaned, 'https://relative.invalid').protocol.toLowerCase()
  } catch {
    return ''
  }

  return SAFE_SCHEMES.includes(protocol) ? cleaned : ''
}
