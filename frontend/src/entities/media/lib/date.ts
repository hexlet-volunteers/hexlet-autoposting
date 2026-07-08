/**
 * Форматтер «день месяц» по-русски, без года и времени (например «1 июля»).
 * По требованию макета собираем строку через Intl.DateTimeFormat, а не вручную.
 */
const shortDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
})

/** Короткая дата для плитки и предпросмотра медиатеки, например «12 ноября». */
export function formatDateShort(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : shortDateFormatter.format(date)
}
