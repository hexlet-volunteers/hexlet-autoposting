import type { MemberRole } from './types'

/**
 * Роль «текущего пользователя проекта» — мок Design First: кто залогинен и
 * какая у него роль, появится с бэкендом и интеграцией API (#147).
 *
 * По умолчанию — владелец, чтобы демо оставалось интерактивным. Чтобы
 * проверить режим «только чтение» на странице «Команда», временно поставьте
 * 'author' или 'editor'.
 */
const CURRENT_MEMBER_ROLE: MemberRole = 'owner'

/** Роль текущего пользователя в проекте (мок). */
export function useCurrentMemberRole(): MemberRole {
  return CURRENT_MEMBER_ROLE
}
