import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')

/** Human-readable date-time for display, e.g. "5 июля 2026 г., 14:30". */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const d = dayjs(value)
  return d.isValid() ? d.format('D MMMM YYYY, HH:mm') : '—'
}

/** ISO string for sending to the API. */
export function toIso(value: Date | null | undefined): string {
  return value ? dayjs(value).toISOString() : ''
}
