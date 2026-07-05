import type { MantineColor } from '@mantine/core'

/** Post lifecycle statuses, matching the buckets returned by GET /posts. */
export const POST_STATUSES = ['processing', 'scheduled', 'published', 'failed'] as const

export type PostStatus = (typeof POST_STATUSES)[number]

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  processing: 'В обработке',
  scheduled: 'Запланировано',
  published: 'Опубликовано',
  failed: 'Ошибка',
}

export const POST_STATUS_COLOR: Record<PostStatus, MantineColor> = {
  processing: 'blue',
  scheduled: 'yellow',
  published: 'green',
  failed: 'red',
}
