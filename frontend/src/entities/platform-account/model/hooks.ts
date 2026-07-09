import { useQuery } from '@tanstack/react-query'
import type { Connection } from './types'
import { MOCK_CONNECTIONS } from './mock'

export const connectionKeys = {
  all: ['connections'] as const,
}

/**
 * Подключения площадок текущего проекта.
 * Мок через useQuery (эталон — entities/project/api/projectApi.ts): помимо data,
 * наружу уходят isLoading/isError — экраны показывают скелетоны и ошибку.
 * TODO (Design First, backlog #118): заменить мок на GET /projects/{id}/connections.
 */
export function useConnections() {
  return useQuery({
    queryKey: connectionKeys.all,
    queryFn: async (): Promise<Connection[]> => MOCK_CONNECTIONS,
    // Отдаём синхронно, чтобы статусы были доступны на первом рендере (как в entities/project).
    initialData: MOCK_CONNECTIONS,
    staleTime: Infinity,
  })
}
