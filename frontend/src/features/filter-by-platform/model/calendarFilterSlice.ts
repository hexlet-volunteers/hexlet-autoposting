import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { NETWORKS } from '@/shared/config'

/**
 * Фильтр календаря по площадкам (чисто UI-состояние, Redux Toolkit).
 * Храним набор «активных» networkId: пост показывается, если хотя бы одна
 * из его площадок активна. Изначально активны все 7 площадок.
 */
export interface CalendarFilterState {
  activeNetworkIds: string[]
}

const initialState: CalendarFilterState = {
  activeNetworkIds: NETWORKS.map((n) => n.id),
}

export const calendarFilterSlice = createSlice({
  name: 'calendarFilter',
  initialState,
  reducers: {
    toggleNetwork(state, action: PayloadAction<string>) {
      const id = action.payload
      if (state.activeNetworkIds.includes(id)) {
        state.activeNetworkIds = state.activeNetworkIds.filter((n) => n !== id)
      } else {
        state.activeNetworkIds.push(id)
      }
    },
  },
})

export const { toggleNetwork } = calendarFilterSlice.actions

export const selectActiveNetworkIds = (state: { calendarFilter: CalendarFilterState }): string[] =>
  state.calendarFilter.activeNetworkIds
