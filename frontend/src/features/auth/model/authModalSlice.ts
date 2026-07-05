import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

/** Режим auth-модалки. Один компонент морфится между тремя состояниями (как в макете). */
export type AuthMode = 'login' | 'register' | 'reset'

/** UI/клиентское состояние (Redux Toolkit): открыта ли модалка и в каком режиме. */
export interface AuthModalState {
  opened: boolean
  mode: AuthMode
}

const initialState: AuthModalState = { opened: false, mode: 'login' }

export const authModalSlice = createSlice({
  name: 'authModal',
  initialState,
  reducers: {
    openAuth(state, action: PayloadAction<AuthMode | undefined>) {
      state.opened = true
      state.mode = action.payload ?? 'login'
    },
    closeAuth(state) {
      state.opened = false
    },
    setAuthMode(state, action: PayloadAction<AuthMode>) {
      state.mode = action.payload
    },
  },
})

export const { openAuth, closeAuth, setAuthMode } = authModalSlice.actions

export const selectAuthModal = (state: { authModal: AuthModalState }): AuthModalState =>
  state.authModal
