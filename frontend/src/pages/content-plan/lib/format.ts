/** Русское склонение: plural(3, ['пост', 'поста', 'постов']) → «поста». */
export function plural(n: number, forms: [string, string, string]): string {
  const b = Math.abs(n) % 100
  const c = b % 10
  if (b > 10 && b < 20) return forms[2]
  if (c > 1 && c < 5) return forms[1]
  if (c === 1) return forms[0]
  return forms[2]
}

/** «N постов» — счётчик для пилюли и плиток года. */
export function postCountLabel(n: number): string {
  return `${n} ${plural(n, ['пост', 'поста', 'постов'])}`
}

/** «ноябрь 2026» → «Ноябрь 2026» (dayjs отдаёт названия месяцев со строчной). */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Короткие названия месяцев для плиток вида «Год» (у dayjs — «нояб.», в макете — «Ноя»). */
export const MONTHS_SHORT = [
  'Янв',
  'Фев',
  'Мар',
  'Апр',
  'Май',
  'Июн',
  'Июл',
  'Авг',
  'Сен',
  'Окт',
  'Ноя',
  'Дек',
]

/** Дательный падеж для подсказки вида «Год»: «Клик по ноябрю откроет месяц». */
export const MONTHS_DATIVE = [
  'январю',
  'февралю',
  'марту',
  'апрелю',
  'маю',
  'июню',
  'июлю',
  'августу',
  'сентябрю',
  'октябрю',
  'ноябрю',
  'декабрю',
]
