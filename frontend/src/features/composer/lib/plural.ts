/**
 * Русское склонение по числу: plural(2, ['публикация', 'публикации', 'публикаций'])
 * вернёт «публикации». Формы: [одна, две-четыре, пять и больше].
 */
export function plural(count: number, forms: [string, string, string]): string {
  const abs = Math.abs(count) % 100
  if (abs > 10 && abs < 20) return forms[2]
  const digit = abs % 10
  if (digit === 1) return forms[0]
  if (digit > 1 && digit < 5) return forms[1]
  return forms[2]
}
