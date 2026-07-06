/** Проект — верхнеуровневый «тенант» продукта (бренд/клиент). */
export interface Project {
  id: string
  name: string
  color: string
  /** Буква для аватара-плашки (первая буква названия). */
  letter: string
  archived?: boolean
}
