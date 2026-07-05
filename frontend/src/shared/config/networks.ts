/** 7 площадок «Отложки» с брендовыми цветами и короткими кодами (из макетов). */
export interface Network {
  id: string
  name: string
  code: string
  color: string
}

export const NETWORKS: Network[] = [
  { id: 'vk', name: 'ВКонтакте', code: 'ВК', color: '#0077FF' },
  { id: 'tg', name: 'Telegram', code: 'TG', color: '#27A6E5' },
  { id: 'ok', name: 'Одноклассники', code: 'ОК', color: '#F7931E' },
  { id: 'max', name: 'MAX', code: 'MAX', color: '#6E5BFF' },
  { id: 'dzen', name: 'Дзен', code: 'Дз', color: '#1E1E20' },
  { id: 'rutube', name: 'RUTUBE', code: 'RT', color: '#E23B54' },
  { id: 'youtube', name: 'YouTube', code: 'YT', color: '#FF0000' },
]
