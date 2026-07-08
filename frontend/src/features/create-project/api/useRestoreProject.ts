import { useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { projectKeys } from '@/entities/project'
import type { Project } from '@/entities/project'

/**
 * Клиентское восстановление проекта из архива (заглушка): снимаем флаг archived в кэше TanStack Query.
 * TODO (Design First, backlog #117): POST /projects/{id}/restore.
 */
export function useRestoreProject() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.setQueryData<Project[]>(projectKeys.all, (old = []) =>
      old.map((p) => (p.id === id ? { ...p, archived: false } : p)),
    )
    notifications.show({ color: 'green', message: 'Проект восстановлен из архива (демо)' })
  }
}
