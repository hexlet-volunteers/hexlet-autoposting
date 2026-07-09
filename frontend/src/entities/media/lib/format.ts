import type { Media } from '../model/types'

/**
 * Метка типа для строки метаданных предпросмотра: расширение из имени файла
 * («.jpg» → JPG, «.png» → PNG, «.mp4» → MP4). Если расширения в имени нет —
 * грубый fallback по kind (photo → JPG, video → MP4).
 */
export function getMediaTypeLabel(media: Pick<Media, 'name' | 'kind'>): string {
  const match = /\.([a-z0-9]+)$/i.exec(media.name.trim())
  if (match) return match[1].toUpperCase()
  return media.kind === 'video' ? 'MP4' : 'JPG'
}
