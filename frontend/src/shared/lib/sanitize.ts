import DOMPurify from 'dompurify'

// Санитайзинг пользовательского контента (#215/#239).
// Предупредительный guardrail: сейчас весь пользовательский текст рендерится как текст
// (React экранирует), но как только появится RichText-HTML (#195) или HTML-предпросмотр
// площадки (#183), sanitizeHtml должен стоять на границе рендера — до любого innerHTML.

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

/** Теги, разрешённые в санитайзенном HTML пользовательского контента. */
const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br', 'p']
/** Атрибуты-белый список: только ссылочные, чтобы отсечь on*, style и прочее. */
const ALLOWED_ATTR = ['href', 'target', 'rel']

// Хук на границе очистки: прогоняем href через sanitizeUrl и навешиваем безопасный rel.
// Регистрируется один раз при импорте модуля (DOMPurify — синглтон).
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    const safeHref = sanitizeUrl(node.getAttribute('href'))
    if (safeHref === '') {
      // Небезопасная схема — снимаем ссылку целиком, оставляя только текст
      node.removeAttribute('href')
      node.removeAttribute('target')
      node.removeAttribute('rel')
    } else {
      node.setAttribute('href', safeHref)
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  }
})

/**
 * Очищает HTML пользовательского контента: оставляет только whitelist тегов/атрибутов,
 * вырезает on*, style, <script>, <iframe> и небезопасные ссылки.
 * Использовать ПЕРЕД любым рендером HTML из API/ввода (dangerouslySetInnerHTML запрещён линтером).
 */
export function sanitizeHtml(dirty: unknown): string {
  if (typeof dirty !== 'string') return ''
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ['script', 'iframe', 'style'],
    FORBID_ATTR: ['style'],
  })
}
