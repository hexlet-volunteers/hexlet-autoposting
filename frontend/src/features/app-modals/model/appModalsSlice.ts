import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

/**
 * Открытие/закрытие глобальных модалок приложения (UI-состояние, Redux Toolkit).
 * Так любой экран может открыть композер / апгрейд / подключение площадки без прямого связывания.
 */
export interface AppModalsState {
  composer: { opened: boolean; postId: string | null }
  upgrade: { opened: boolean }
  connectPlatform: { opened: boolean }
}

const initialState: AppModalsState = {
  composer: { opened: false, postId: null },
  upgrade: { opened: false },
  connectPlatform: { opened: false },
}

export const appModalsSlice = createSlice({
  name: 'appModals',
  initialState,
  reducers: {
    openComposer(state, action: PayloadAction<string | undefined>) {
      state.composer = { opened: true, postId: action.payload ?? null }
    },
    closeComposer(state) {
      state.composer.opened = false
    },
    openUpgrade(state) {
      state.upgrade.opened = true
    },
    closeUpgrade(state) {
      state.upgrade.opened = false
    },
    openConnectPlatform(state) {
      state.connectPlatform.opened = true
    },
    closeConnectPlatform(state) {
      state.connectPlatform.opened = false
    },
  },
})

export const {
  openComposer,
  closeComposer,
  openUpgrade,
  closeUpgrade,
  openConnectPlatform,
  closeConnectPlatform,
} = appModalsSlice.actions

export const selectAppModals = (state: { appModals: AppModalsState }): AppModalsState =>
  state.appModals
