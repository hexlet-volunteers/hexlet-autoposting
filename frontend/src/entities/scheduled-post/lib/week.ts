import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import 'dayjs/locale/ru'

// Русская локаль нужна подписям дат контент-плана («17–23 ноября» и т.п.)
dayjs.locale('ru')

/**
 * Понедельник недели, в которую попадает дата (00:00).
 *
 * Считаем от dayjs().day() (0 = воскресенье независимо от локали), а не от
 * startOf('week'): результат последнего зависит от того, успела ли включиться
 * глобальная локаль ru, и даёт «плавающее» начало недели.
 */
export function startOfWeekMonday(date: Dayjs): Dayjs {
  return date.startOf('day').subtract((date.day() + 6) % 7, 'day')
}

/** Дата попадает в неделю, начинающуюся с weekStart (понедельник)? */
export function isInWeek(date: Dayjs, weekStart: Dayjs): boolean {
  return !date.isBefore(weekStart) && date.isBefore(weekStart.add(7, 'day'))
}
