import { configureStore } from '@reduxjs/toolkit'
import { sessionSlice } from '@/entities/session'
import { postsFilterSlice } from '@/features/filter-posts-by-status'
import { authModalSlice } from '@/features/auth'

/**
 * Redux Toolkit store — holds ONLY client/UI state (session, filters).
 * Server state lives in TanStack Query (see shared/config/queryClient.ts).
 */
export const store = configureStore({
  reducer: {
    session: sessionSlice.reducer,
    postsFilter: postsFilterSlice.reducer,
    authModal: authModalSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
