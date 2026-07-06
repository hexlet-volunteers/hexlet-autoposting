import type { Connection } from './types'
import { MOCK_CONNECTIONS } from './mock'

/**
 * Подключения площадок текущего проекта.
 * Заглушка на локальном моке — форма ответа повторяет будущий API.
 * TODO (Design First, backlog #118): GET /projects/{id}/connections.
 */
export function useConnections(): { data: Connection[] } {
  return { data: MOCK_CONNECTIONS }
}
