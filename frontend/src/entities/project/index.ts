export { useProjects, projectKeys } from './api/projectApi'
export {
  projectSlice,
  setCurrentProject,
  selectCurrentProjectId,
} from './model/projectSlice'
export type { ProjectState } from './model/projectSlice'
export { useCurrentProject } from './model/hooks'
export type { Project } from './model/types'
