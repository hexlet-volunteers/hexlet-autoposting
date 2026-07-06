import type { Media } from './types'

/**
 * Мок медиатеки (~8 элементов, микс фото/видео).
 * TODO (Design First, backlog): заменить на GET /media (oapi-codegen хук),
 * поля прийдут из OpenAPI-схемы MediaAsset.
 */
export const MEDIA_MOCK: Media[] = [
  {
    id: 'm1',
    name: 'Обложка-акции.jpg',
    kind: 'photo',
    sizeLabel: '1,8 МБ',
    uploadedAt: '2026-07-01T09:12:00',
  },
  {
    id: 'm2',
    name: 'Ролик-бэкстейдж.mp4',
    kind: 'video',
    sizeLabel: '128 МБ',
    uploadedAt: '2026-06-28T14:40:00',
  },
  {
    id: 'm3',
    name: 'Карточка-товара-1.png',
    kind: 'photo',
    sizeLabel: '640 КБ',
    uploadedAt: '2026-06-27T11:05:00',
  },
  {
    id: 'm4',
    name: 'Промо-шортс.mp4',
    kind: 'video',
    sizeLabel: '54 МБ',
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
    uploadedAt: '2026-06-22T16:00:00',
  },
  {
    id: 'm7',
    name: 'Анонс-вебинара.mp4',
    kind: 'video',
    sizeLabel: '96 МБ',
    uploadedAt: '2026-06-20T10:45:00',
  },
  {
    id: 'm8',
    name: 'Инфографика-итоги.png',
    kind: 'photo',
    sizeLabel: '1,1 МБ',
    uploadedAt: '2026-06-18T13:15:00',
  },
]
