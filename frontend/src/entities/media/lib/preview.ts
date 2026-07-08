/**
 * SVG-заглушка превью в виде data-URI: реальных файлов на мок-уровне нет,
 * поэтому «картинки» медиатеки рисуем на лету — подпись на цветном фоне.
 */
export function makeMockPreviewUrl(
  label: string,
  bg = '#F6F4EF',
  fg = 'rgba(23,21,15,.55)',
): string {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">' +
    `<rect width="640" height="400" fill="${bg}"/>` +
    `<text x="320" y="206" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="${fg}">${label}</text>` +
    '</svg>'
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/** Fallback предпросмотра на случай пустого или битого url (Image fallbackSrc). */
export const MEDIA_PREVIEW_FALLBACK = makeMockPreviewUrl('превью недоступно')
