import dayjs from 'dayjs'
import type { Post } from '@/entities/scheduled-post'

/**
 * Модель формы композера: типы, константы расписания и билдеры значений.
 * Всё это — UI-состояние; серверный кэш (['scheduled-posts']) трогают
 * только мок-мутации из ../api при сабмите/удалении.
 */

/** Тип содержимого композера: обычный пост или видеоролик. */
export type PostKind = 'post' | 'video'

/** Режим повтора публикации (пока только UI-состояние, бэкенда нет). */
export type RepeatMode = 'none' | 'day' | 'week' | 'month'

/** Значения формы композера. */
export interface ComposerFormValues {
  kind: PostKind
  /** HTML из RichText-заглушки (тип «Пост»). */
  text: string
  /** Имена прикреплённых фото (мок, до 4). */
  attachments: string[]
  videoFile: string
  videoTitle: string
  videoDescription: string
  cover: string
  /** id выбранных площадок из NETWORKS. */
  networks: string[]
  /** День недели публикации: 0 = Пн … 6 = Вс. */
  day: number
  hours: string
  minutes: string
  seconds: string
  repeat: RepeatMode
}

export const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

/** Видеоплощадки: для типа «Пост» заблокированы (доступны только для «Видео»). */
export const VIDEO_NETWORK_IDS: readonly string[] = ['rutube', 'youtube']

export const REPEAT_OPTIONS: { value: RepeatMode; label: string }[] = [
  { value: 'none', label: 'Не повторять' },
  { value: 'day', label: 'Каждый день' },
  { value: 'week', label: 'Каждую неделю' },
  { value: 'month', label: 'Каждый месяц' },
]

/** Подпись под селектом «Повторять» — как в макете app-dashboard. */
export const REPEAT_HINTS: Record<RepeatMode, string> = {
  none: 'разово',
  day: 'все 7 дней недели',
  week: 'в эту и следующие недели',
  month: 'ежемесячно, начиная с этой недели',
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Колонки пикера времени: 24 часа и по 60 минут/секунд. */
export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => pad2(i))
export const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => pad2(i))
export const SECOND_OPTIONS = MINUTE_OPTIONS

/**
 * Начало недели контент-плана — ровно та же формула, что в entities/scheduled-post
 * (startOf('week') + 1 день), чтобы индекс дня совпадал с колонкой календаря.
 */
function contentWeekStart() {
  return dayjs().startOf('week').add(1, 'day').startOf('day')
}

/** Индекс колонки недели (0..6) для даты; даты вне недели прижимаем к краям. */
function dayIndexOf(date: dayjs.Dayjs): number {
  const index = date.startOf('day').diff(contentWeekStart(), 'day')
  return Math.min(6, Math.max(0, index))
}

/** Пустая форма нового поста: сегодняшняя колонка недели, 12:00:00, без площадок. */
export function makeDefaultValues(): ComposerFormValues {
  return {
    kind: 'post',
    text: '',
    attachments: [],
    videoFile: '',
    videoTitle: '',
    videoDescription: '',
    cover: '',
    networks: [],
    day: dayIndexOf(dayjs()),
    hours: '12',
    minutes: '00',
    seconds: '00',
    repeat: 'none',
  }
}

/** Преднастройка формы данными существующего поста (режим «Настройки поста»). */
export function makeValuesFromPost(post: Post): ComposerFormValues {
  const date = dayjs(post.scheduledAt)
  // Видеоплощадки доступны только типу «Видео» — по ним и восстанавливаем тип
  const isVideo = post.networkIds.some((id) => VIDEO_NETWORK_IDS.includes(id))
  return {
    kind: isVideo ? 'video' : 'post',
    text: isVideo ? '' : post.text,
    attachments: isVideo
      ? []
      : Array.from({ length: post.mediaCount ?? 0 }, (_, i) => `фото ${i + 1}.jpg`),
    videoFile: isVideo ? 'видео.mp4' : '',
    videoTitle: isVideo ? post.title.replace(/^▶ /, '') : '',
    videoDescription: isVideo ? post.text : '',
    cover: '',
    networks: [...post.networkIds],
    day: dayIndexOf(date),
    hours: pad2(date.hour()),
    minutes: pad2(date.minute()),
    seconds: pad2(date.second()),
    repeat: 'none',
  }
}

/** ISO-дата публикации: выбранная колонка ТЕКУЩЕЙ недели контент-плана + время. */
export function buildScheduledAt(values: ComposerFormValues): string {
  return contentWeekStart()
    .add(values.day, 'day')
    .hour(Number(values.hours))
    .minute(Number(values.minutes))
    .second(Number(values.seconds))
    .millisecond(0)
    .toISOString()
}

/** Плоский текст из HTML RichText-заглушки (для карточек календаря/очереди). */
export function htmlToPlainText(html: string): string {
  const box = document.createElement('div')
  box.innerHTML = html
  return (box.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/** Подпись поста для календаря — как в макете: до 26 символов с многоточием. */
export function buildPostTitle(values: ComposerFormValues): string {
  const raw =
    values.kind === 'video'
      ? `▶ ${values.videoTitle.trim() || 'Новое видео'}`
      : htmlToPlainText(values.text) || 'Новый пост'
  return raw.length > 26 ? `${raw.slice(0, 24)}…` : raw
}
