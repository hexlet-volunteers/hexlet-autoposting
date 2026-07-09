import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

/**
 * Открытие/закрытие глобальных модалок приложения (UI-состояние, Redux Toolkit).
 * Так любой экран может открыть композер / апгрейд / подключение площадки без прямого связывания.
 */
export interface AppModalsState {
  composer: { opened: boolean; postId: string | null }
  upgrade: { opened: boolean }
  connectPlatform: { opened: boolean; networkId: string | null }
}

const initialState: AppModalsState = {
  composer: { opened: false, postId: null },
  upgrade: { opened: false },
  connectPlatform: { opened: false, networkId: null },
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
    // С networkId — модалка конкретной площадки, без — общий список (как postId у composer)
    openConnectPlatform(state, action: PayloadAction<string | undefined>) {
      state.connectPlatform = { opened: true, networkId: action.payload ?? null }
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
