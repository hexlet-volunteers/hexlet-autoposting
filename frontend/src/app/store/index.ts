import { configureStore } from '@reduxjs/toolkit'
import { authModalSlice } from '@/features/auth'
import { projectSlice } from '@/entities/project'
import { appModalsSlice } from '@/features/app-modals'

/**
 * Redux Toolkit store — holds ONLY client/UI state (session, filters).
 * Server state lives in TanStack Query (see shared/config/queryClient.ts).
 */
export const store = configureStore({
  reducer: {
    authModal: authModalSlice.reducer,
    project: projectSlice.reducer,
    appModals: appModalsSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
