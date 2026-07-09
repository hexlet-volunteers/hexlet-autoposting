/**
 * Плюрализация по-русски: выбирает форму слова по числу.
 * Формы: [одна штука, 2–4 штуки, много] — например ['файл', 'файла', 'файлов'].
 * 1 → «файл», 2 → «файла», 5 → «файлов», 11 → «файлов», 21 → «файл».
 */
export function pluralizeRu(count: number, forms: [string, string, string]): string {
  const abs = Math.abs(Math.trunc(count))
  const mod100 = abs % 100
  const mod10 = abs % 10
  if (mod100 >= 11 && mod100 <= 14) return forms[2]
  if (mod10 === 1) return forms[0]
  if (mod10 >= 2 && mod10 <= 4) return forms[1]
  return forms[2]
}

/** Формы слова «файл» для счётчиков загрузки: 1 файл, 2 файла, 5 файлов. */
export const FILE_PLURAL_FORMS: [string, string, string] = ['файл', 'файла', 'файлов']
