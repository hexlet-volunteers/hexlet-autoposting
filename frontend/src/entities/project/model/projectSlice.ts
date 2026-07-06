import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

/** UI/клиентское состояние: какой проект сейчас активен (Redux Toolkit). */
export interface ProjectState {
  currentProjectId: string
}

const initialState: ProjectState = { currentProjectId: 'p1' }

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentProject(state, action: PayloadAction<string>) {
      state.currentProjectId = action.payload
    },
  },
})

export const { setCurrentProject } = projectSlice.actions

export const selectCurrentProjectId = (state: { project: ProjectState }): string =>
  state.project.currentProjectId
