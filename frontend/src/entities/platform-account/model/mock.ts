import type { Connection } from './types'

/**
 * Демо-данные подключений: часть из 7 площадок подключена (с аккаунтом),
 * остальные — нет. Порядок соответствует NETWORKS из @/shared/config/networks.
 * TODO (Design First, backlog #118): заменить на GET /projects/{id}/connections.
 */
export const MOCK_CONNECTIONS: Connection[] = [
  { networkId: 'vk', connected: true, account: 'Сообщество «Отложка»' },
  { networkId: 'tg', connected: true, account: '@otlozhka' },
  { networkId: 'ok', connected: false },
  { networkId: 'max', connected: false },
  { networkId: 'dzen', connected: true, account: 'Канал «Отложка»' },
  { networkId: 'rutube', connected: false },
  { networkId: 'youtube', connected: false },
]
