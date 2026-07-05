import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

/**
 * Session = CLIENT state (owned by Redux Toolkit, per the FE architecture decision).
 *
 * Until real auth lands (backlog #60/#82), the backend requires an explicit `id_user`,
 * so we keep the "current user id" here and let the user switch it from the header.
 * When JWT auth arrives this slice holds the authenticated identity / UI auth state
 * instead, and server data still flows through TanStack Query.
 */
export interface SessionState {
  currentUserId: number
}

const initialState: SessionState = {
  currentUserId: 1,
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCurrentUserId(state, action: PayloadAction<number>) {
      state.currentUserId = action.payload
    },
  },
})

export const { setCurrentUserId } = sessionSlice.actions

/** Structural selector — no dependency on the app-level RootState (keeps FSD layering). */
export const selectCurrentUserId = (state: { session: SessionState }): number =>
  state.session.currentUserId
