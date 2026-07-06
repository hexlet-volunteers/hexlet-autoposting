import { useSelector } from 'react-redux'
import { useProjects } from '../api/projectApi'
import { selectCurrentProjectId } from './projectSlice'
import type { Project } from './types'

/** Текущий активный проект (из списка + выбранного id). */
export function useCurrentProject(): Project | undefined {
  const id = useSelector(selectCurrentProjectId)
  const { data } = useProjects()
  return data?.find((p) => p.id === id) ?? data?.find((p) => !p.archived)
}
