import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')

/** Короткая дата для плитки медиатеки, например «12 ноября». */
export function formatDateShort(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const d = dayjs(value)
  return d.isValid() ? d.format('D MMMM') : '—'
}
