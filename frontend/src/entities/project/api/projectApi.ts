import { useQuery } from '@tanstack/react-query'
import type { Project } from '../model/types'

export const projectKeys = {
  all: ['projects'] as const,
}

// TODO (Design First, backlog #117): заменить мок на GET /projects (oapi-codegen хук).
const SEED: Project[] = [
  { id: 'p1', name: 'Мой бренд', color: '#2B50EC', letter: 'М' },
  { id: 'p2', name: 'Кофейня «Молоко»', color: '#22A06B', letter: 'К' },
  { id: 'p3', name: 'Студия дизайна', color: '#E23B54', letter: 'С', archived: true },
]

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: async (): Promise<Project[]> => SEED,
    // Отдаём синхронно, чтобы проект был доступен на первом рендере (сайдбар, префилл настроек).
    initialData: SEED,
    staleTime: Infinity,
  })
}
