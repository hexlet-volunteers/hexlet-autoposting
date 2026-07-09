/**
 * Мок-API подключения площадок: бэкенда пока нет, «OAuth»-авторизация и запросы
 * эмулируются задержкой ~700мс (по образцу features/auth/api/mockAuthApi.ts).
 * Ошибка триггерится заранее заданной площадкой (см. константу ниже) — так можно
 * вручную проверить состояния loading/error. Реальные запросы к API и настоящий
 * OAuth-редирект — отдельные backend-задачи и #147.
 */

/** Задержка мок-запроса, мс */
const MOCK_DELAY_MS = 700

/** Площадка-триггер ошибки: первая попытка авторизации в RUTUBE падает, повторная — успешна */
export const MOCK_AUTH_ERROR_NETWORK_ID = 'rutube'

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))

/** Сообщество/канал площадки, от имени которого будут публиковаться посты */
export interface ConnectTarget {
  id: string
  label: string
}

/** Мок-каталог доступных целей публикации по площадкам (как будто пришёл из «OAuth»-ответа) */
const MOCK_TARGETS: Record<string, ConnectTarget[]> = {
  vk: [
    { id: 'vk-1', label: 'Сообщество «Отложка»' },
    { id: 'vk-2', label: 'Сообщество «Кофейня у дома»' },
    { id: 'vk-3', label: 'Личная страница' },
  ],
  tg: [
    { id: 'tg-1', label: 'Канал @otlozhka' },
    { id: 'tg-2', label: 'Канал @coffee_dom' },
  ],
  ok: [
    { id: 'ok-1', label: 'Группа «Отложка»' },
    { id: 'ok-2', label: 'Группа «Кофейня у дома»' },
  ],
  max: [
    { id: 'max-1', label: 'Канал «Отложка»' },
    { id: 'max-2', label: 'Канал «Кофейня у дома»' },
  ],
  dzen: [
    { id: 'dzen-1', label: 'Канал «Отложка»' },
    { id: 'dzen-2', label: 'Канал «Истории кофейни»' },
  ],
  rutube: [
    { id: 'rutube-1', label: 'Канал «Отложка»' },
    { id: 'rutube-2', label: 'Канал «Кофейня у дома»' },
  ],
  youtube: [
    { id: 'youtube-1', label: 'Канал «Отложка»' },
    { id: 'youtube-2', label: 'Канал «Кофейня у дома»' },
  ],
}

/**
 * Мок «OAuth»-авторизации на стороне площадки: в ответ отдаёт список доступных
 * сообществ/каналов. Номер попытки нужен для триггера ошибки (см. константу выше).
 */
export async function mockAuthorize(networkId: string, attempt: number): Promise<ConnectTarget[]> {
  await wait()
  if (networkId === MOCK_AUTH_ERROR_NETWORK_ID && attempt === 1) {
    throw new Error('Площадка не ответила на запрос авторизации. Попробуйте ещё раз.')
  }
  return MOCK_TARGETS[networkId] ?? []
}

/** Мок записи выбранной цели публикаций в подключение */
export async function mockConfirmTarget(): Promise<void> {
  await wait()
}

/** Мок отключения площадки */
export async function mockDisconnect(): Promise<void> {
  await wait()
}

/** Достаём текст ошибки из мок-запроса (на будущее — из ответа API) */
export function getConnectErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Что-то пошло не так. Попробуйте ещё раз.'
}
