import { useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { notifications } from '@mantine/notifications'
import { projectKeys, setCurrentProject } from '@/entities/project'
import type { Project } from '@/entities/project'

/**
 * Клиентское создание проекта (заглушка): добавляем в кэш TanStack Query и делаем активным.
 * TODO (Design First, backlog #117): POST /projects.
 */
export function useCreateProject() {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()

  return (name: string, color: string) => {
    const id = `p-${Date.now()}`
    const project: Project = {
      id,
      name: name.trim(),
      color,
      letter: name.trim().charAt(0).toUpperCase() || '?',
    }
    queryClient.setQueryData<Project[]>(projectKeys.all, (old = []) => [...old, project])
    dispatch(setCurrentProject(id))
    notifications.show({ color: 'green', message: 'Проект создан (демо)' })
    return project
  }
}
