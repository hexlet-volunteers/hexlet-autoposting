import { createSlice } from '@reduxjs/toolkit'

/**
 * Клиентская мок-сессия: признак «пользователь вошёл» (Redux Toolkit).
 * Реальная сессия — httpOnly-кука + GET /me (backlog #110/#112); токены и PII
 * в клиентском состоянии не хранятся и храниться не будут.
 */
export interface SessionState {
  isAuthenticated: boolean
}

const initialState: SessionState = { isAuthenticated: false }

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    login(state) {
      state.isAuthenticated = true
    },
    logout(state) {
      state.isAuthenticated = false
    },
  },
})

export const { login, logout } = sessionSlice.actions

export const selectIsAuthenticated = (state: { session: SessionState }): boolean =>
  state.session.isAuthenticated
