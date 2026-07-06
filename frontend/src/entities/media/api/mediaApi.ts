import { useQuery } from '@tanstack/react-query'
import { MEDIA_MOCK } from '../model/mock'
import type { Media } from '../model/types'

export const mediaKeys = {
  all: ['media'] as const,
}

/**
 * Медиатека проекта. Пока отдаём мок синхронно через initialData,
 * чтобы сетка была готова на первом рендере.
 * TODO (Design First, backlog): заменить queryFn на GET /media (oapi-codegen хук).
 */
export function useMedia() {
  return useQuery({
    queryKey: mediaKeys.all,
    queryFn: async (): Promise<Media[]> => MEDIA_MOCK,
    initialData: MEDIA_MOCK,
    staleTime: Infinity,
  })
}
