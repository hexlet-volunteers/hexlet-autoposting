import { MIME_TYPES } from '@mantine/dropzone'

// Лимиты и форматы загрузки медиа из макета app-dashboard.html
// (блоки «ЗАГРУЗКА В МЕДИАТЕКУ» и «ЗАГРУЗКА ФАЙЛА»). Используются и модалкой
// медиатеки, и модалкой прикрепления файла к посту — строки не дублируем.
// TODO (Design First, backlog): забирать лимиты из OpenAPI-схемы, когда появится бэкенд.

/** Максимальный размер видео и файлов «Загрузки в медиатеку»: 2 ГБ. */
export const MEDIA_MAX_VIDEO_SIZE = 2 * 1024 ** 3

/** Максимальный размер фото и обложек: 20 МБ. */
export const MEDIA_MAX_PHOTO_SIZE = 20 * 1024 ** 2

/** MIME-типы «Загрузки в медиатеку»: фото и видео вперемешку. */
export const MEDIA_LIBRARY_ACCEPT: string[] = [MIME_TYPES.jpeg, MIME_TYPES.png, MIME_TYPES.mp4]

/** MIME-типы загрузки фото и обложки. */
export const MEDIA_PHOTO_ACCEPT: string[] = [MIME_TYPES.jpeg, MIME_TYPES.png]

/** MIME-типы загрузки видео (MOV = video/quicktime, в MIME_TYPES его нет). */
export const MEDIA_VIDEO_ACCEPT: string[] = [MIME_TYPES.mp4, 'video/quicktime']

/** Подписи форматов под дроп-зонами — ровно как в макете. */
export const MEDIA_LIBRARY_FORMATS_LABEL = 'JPG, PNG, MP4 до 2 ГБ'
export const MEDIA_PHOTO_FORMATS_LABEL = 'JPG, PNG до 20 МБ'
export const MEDIA_VIDEO_FORMATS_LABEL = 'MP4, MOV до 2 ГБ'
