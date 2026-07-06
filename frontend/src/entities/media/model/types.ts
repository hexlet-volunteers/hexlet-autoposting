/** Элемент медиатеки «Отложки»: фото или видео с метаданными для превью. */
export interface Media {
  id: string
  name: string
  kind: 'photo' | 'video'
  sizeLabel: string
  url?: string
  uploadedAt: string
}
