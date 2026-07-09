import {
  MEDIA_MAX_PHOTO_SIZE,
  MEDIA_MAX_VIDEO_SIZE,
  MEDIA_PHOTO_ACCEPT,
  MEDIA_VIDEO_ACCEPT,
  MEDIA_PHOTO_FORMATS_LABEL,
  MEDIA_VIDEO_FORMATS_LABEL,
} from '@/entities/media'

/**
 * Настройки модалки прикрепления медиа — сегмент features/composer.
 * Раньше жили в features/attach-media, но композер не может импортировать
 * соседнюю фичу (границы FSD: фича из фичи запрещена steiger). Поэтому конфиг
 * и сама модалка перенесены в композер и переиспользуют entities/media напрямую.
 */

/** Тип вложения поста, который открывает вызывающий блок композера. */
export type AttachmentKind = 'photo' | 'video' | 'cover'

interface AttachmentKindConfig {
  /** Заголовок модалки. */
  title: string
  /** Подпись форматов под дроп-зоной. */
  formatsLabel: string
  /** MIME-типы для клиентской валидации. */
  accept: string[]
  /** Лимит размера файла в байтах. */
  maxSize: number
  /** Показывать ли блок «Или выберите из медиатеки» (только фото и обложка). */
  withLibrary: boolean
}

/** Настройки модалки «Загрузка файла» по типу вложения — тексты из макета. */
export const ATTACHMENT_KIND_CONFIG: Record<AttachmentKind, AttachmentKindConfig> = {
  photo: {
    title: 'Загрузить фото',
    formatsLabel: MEDIA_PHOTO_FORMATS_LABEL,
    accept: MEDIA_PHOTO_ACCEPT,
    maxSize: MEDIA_MAX_PHOTO_SIZE,
    withLibrary: true,
  },
  video: {
    title: 'Загрузить видео',
    formatsLabel: MEDIA_VIDEO_FORMATS_LABEL,
    accept: MEDIA_VIDEO_ACCEPT,
    maxSize: MEDIA_MAX_VIDEO_SIZE,
    withLibrary: false,
  },
  cover: {
    title: 'Загрузить обложку',
    formatsLabel: MEDIA_PHOTO_FORMATS_LABEL,
    accept: MEDIA_PHOTO_ACCEPT,
    maxSize: MEDIA_MAX_PHOTO_SIZE,
    withLibrary: true,
  },
}
