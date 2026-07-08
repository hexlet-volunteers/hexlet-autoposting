import { useQuery } from '@tanstack/react-query'
import { MEDIA_MOCK } from '../model/mock'
import type { Media } from '../model/types'

export const mediaKeys = {
  all: ['media'] as const,
}

/**
 * Медиатека проекта. Мок отдаётся с короткой задержкой, чтобы при переходе
 * на страницу состояние isLoading было видно скелетонами сетки.
 * TODO (Design First, backlog): заменить queryFn на GET /media (oapi-codegen хук).
 */
export function useMedia() {
  return useQuery({
    queryKey: mediaKeys.all,
    queryFn: async (): Promise<Media[]> => {
      // Эмуляция сетевой задержки, пока нет реального API.
      await new Promise((resolve) => setTimeout(resolve, 400))
      return MEDIA_MOCK
    },
    staleTime: Infinity,
  })
}
