import type { Member } from './types'

// TODO (Design First, backlog #117): заменить мок на GET /projects/{id}/members
// (oapi-codegen хук). Пока — локальные seed-данные из макета «Команда».
const MEMBERS: Member[] = [
  { id: 'm1', name: 'Мария Ковалёва', email: 'maria@otlozhka.ru', role: 'owner', status: 'active' },
  { id: 'm2', name: 'Игорь Смирнов', email: 'igor@studio.ru', role: 'editor', status: 'active' },
  { id: 'm3', name: 'Аня Лебедева', email: 'anya@blog.ru', role: 'author', status: 'active' },
  { id: 'm4', name: 'kollega@example.ru', email: 'kollega@example.ru', role: 'author', status: 'pending' },
]

/** Участники текущего проекта. Мок Design First — реальный источник появится в бэкенде. */
export function useMembers(): { data: Member[] } {
  return { data: MEMBERS }
}
