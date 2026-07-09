import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

/** Режим auth-модалки. Один компонент морфится между тремя состояниями (как в макете). */
export type AuthMode = 'login' | 'register' | 'reset'

/** UI/клиентское состояние (Redux Toolkit): открыта ли модалка и в каком режиме. */
export interface AuthModalState {
  opened: boolean
  mode: AuthMode
  /** Текст ошибки OAuth-входа (возврат с /auth/callback?error=…) — Alert над кнопками сервисов */
  oauthError: string | null
}

const initialState: AuthModalState = { opened: false, mode: 'login', oauthError: null }

export const authModalSlice = createSlice({
  name: 'authModal',
  initialState,
  reducers: {
    // Не сбрасывает oauthError: страница callback ставит текст ошибки ДО того,
    // как /login откроет модалку, — иначе Alert исчезал бы сразу.
    openAuth(state, action: PayloadAction<AuthMode | undefined>) {
      state.opened = true
      state.mode = action.payload ?? 'login'
    },
    closeAuth(state) {
      state.opened = false
      state.oauthError = null
    },
    setAuthMode(state, action: PayloadAction<AuthMode>) {
      state.mode = action.payload
      // Смена вкладки (вход/регистрация/сброс) убирает устаревшую ошибку OAuth
      state.oauthError = null
    },
    setOauthError(state, action: PayloadAction<string | null>) {
      state.oauthError = action.payload
    },
  },
})

export const { openAuth, closeAuth, setAuthMode, setOauthError } = authModalSlice.actions

export const selectAuthModal = (state: { authModal: AuthModalState }): AuthModalState =>
  state.authModal
