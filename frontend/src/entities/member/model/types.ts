/** Роль участника команды в проекте. */
export type MemberRole = 'owner' | 'editor' | 'author'

/** Статус участника: активный или ожидающий принятия приглашения. */
export type MemberStatus = 'active' | 'pending'

/** Участник команды проекта. */
export interface Member {
  id: string
  name: string
  email: string
  role: MemberRole
  status: MemberStatus
}

/** Человеко-читаемые названия ролей (из макета «Команда»). */
export const ROLE_LABELS: Record<MemberRole, string> = {
  owner: 'Владелец',
  editor: 'Редактор',
  author: 'Автор',
}
