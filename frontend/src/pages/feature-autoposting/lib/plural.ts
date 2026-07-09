/**
 * Склонение русских существительных по числу: plural(1|2|5, ['пост', 'поста', 'постов']).
 * Формула — как в интерактивном макете (docs/design/mockups/feature-autoposting.html).
 * Кандидат на перенос в shared/lib, как только утилита понадобится другим слайсам.
 */
export function plural(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return forms[2]
  if (b > 1 && b < 5) return forms[1]
  if (b === 1) return forms[0]
  return forms[2]
}
