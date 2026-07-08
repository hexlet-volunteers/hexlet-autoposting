import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMediaStore, removeFromMediaStore } from '../model/mock'
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
      return getMediaStore()
    },
    staleTime: Infinity,
  })
}

/**
 * Удаление медиа на мок-уровне: правит in-memory список и кладёт результат
 * в кэш по mediaKeys.all (setQueryData), чтобы плитка исчезала из сетки сразу,
 * без перезагрузки страницы.
 * TODO (Design First, backlog #147): заменить mutationFn на DELETE /media/{id}.
 */
export function useDeleteMediaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<Media[]> => {
      // Эмуляция сетевой задержки, пока нет реального API.
      await new Promise((resolve) => setTimeout(resolve, 400))
      return removeFromMediaStore(id)
    },
    onSuccess: (next) => {
      queryClient.setQueryData(mediaKeys.all, next)
    },
  })
}
