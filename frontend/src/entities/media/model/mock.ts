import { makeMockPreviewUrl } from '../lib/preview'
import type { Media } from './types'

// Тёмный кадр для видео-заглушек (превью «стоп-кадра»).
const VIDEO_BG = '#26241D'
const VIDEO_FG = 'rgba(255,255,255,.75)'

/**
 * Мок медиатеки (~8 элементов, микс фото/видео). url — data-URI-заглушки,
 * чтобы предпросмотр показывал «настоящую» картинку без бэкенда;
 * у «Логотип-белый.png» url специально нет — на нём виден fallback.
 * TODO (Design First, backlog): заменить на GET /media (oapi-codegen хук),
 * поля прийдут из OpenAPI-схемы MediaAsset.
 */
export const MEDIA_MOCK: Media[] = [
  {
    id: 'm1',
    name: 'Обложка-акции.jpg',
    kind: 'photo',
    sizeLabel: '1,8 МБ',
    url: makeMockPreviewUrl('Обложка-акции.jpg', '#DCE4FB'),
    uploadedAt: '2026-07-01T09:12:00',
  },
  {
    id: 'm2',
    name: 'Ролик-бэкстейдж.mp4',
    kind: 'video',
    sizeLabel: '128 МБ',
    url: makeMockPreviewUrl('Ролик-бэкстейдж.mp4', VIDEO_BG, VIDEO_FG),
    uploadedAt: '2026-06-28T14:40:00',
  },
  {
    id: 'm3',
    name: 'Карточка-товара-1.png',
    kind: 'photo',
    sizeLabel: '640 КБ',
    url: makeMockPreviewUrl('Карточка-товара-1.png', '#F1E6CE'),
    uploadedAt: '2026-06-27T11:05:00',
  },
  {
    id: 'm4',
    name: 'Промо-шортс.mp4',
    kind: 'video',
    sizeLabel: '54 МБ',
    url: makeMockPreviewUrl('Промо-шортс.mp4', VIDEO_BG, VIDEO_FG),
    uploadedAt: '2026-06-25T18:30:00',
  },
  {
    id: 'm5',
    name: 'Логотип-белый.png',
    kind: 'photo',
    sizeLabel: '212 КБ',
    uploadedAt: '2026-06-24T08:20:00',
  },
  {
    id: 'm6',
    name: 'Фото-команды.jpg',
    kind: 'photo',
    sizeLabel: '3,2 МБ',
    url: makeMockPreviewUrl('Фото-команды.jpg', '#DFF0E4'),
    uploadedAt: '2026-06-22T16:00:00',
  },
  {
    id: 'm7',
    name: 'Анонс-вебинара.mp4',
    kind: 'video',
    sizeLabel: '96 МБ',
    url: makeMockPreviewUrl('Анонс-вебинара.mp4', VIDEO_BG, VIDEO_FG),
    uploadedAt: '2026-06-20T10:45:00',
  },
  {
    id: 'm8',
    name: 'Инфографика-итоги.png',
    kind: 'photo',
    sizeLabel: '1,1 МБ',
    url: makeMockPreviewUrl('Инфографика-итоги.png', '#F4E2E0'),
    uploadedAt: '2026-06-18T13:15:00',
  },
]

/**
 * Мутабельный in-memory список — «база данных» мок-уровня. Мутации медиатеки
 * (загрузка/удаление) правят его и синхронно кладут результат в кэш TanStack
 * Query, поэтому повторный fetch (например после invalidateQueries) не
 * «воскресит» удалённое и не потеряет добавленное.
 */
let mediaStore: Media[] = [...MEDIA_MOCK]

/** Снимок текущего списка медиатеки (копия — наружу мутабельный массив не отдаём). */
export function getMediaStore(): Media[] {
  return [...mediaStore]
}

/** Добавляет элемент в начало списка (новое — первым) и возвращает снимок. */
export function addToMediaStore(item: Media): Media[] {
  mediaStore = [item, ...mediaStore]
  return getMediaStore()
}

/** Удаляет элемент по id и возвращает снимок обновлённого списка. */
export function removeFromMediaStore(id: string): Media[] {
  mediaStore = mediaStore.filter((item) => item.id !== id)
  return getMediaStore()
}
