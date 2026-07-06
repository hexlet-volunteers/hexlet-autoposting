/**
 * Подключение площадки к проекту: связь одной из 7 соцсетей (networkId → Network.id)
 * с аккаунтом/сообществом пользователя.
 */
export interface Connection {
  networkId: string
  connected: boolean
  account?: string
}
