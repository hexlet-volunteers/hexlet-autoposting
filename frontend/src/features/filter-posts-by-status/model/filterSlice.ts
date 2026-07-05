import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { POST_STATUSES } from '@/shared/config/postStatus'
import type { PostStatus } from '@/shared/config/postStatus'

/** UI/client state (Redux Toolkit): which post statuses are currently shown. */
export interface PostsFilterState {
  statuses: PostStatus[]
}

const initialState: PostsFilterState = {
  statuses: [...POST_STATUSES],
}

export const postsFilterSlice = createSlice({
  name: 'postsFilter',
  initialState,
  reducers: {
    setStatuses(state, action: PayloadAction<PostStatus[]>) {
      state.statuses = action.payload
    },
    reset(state) {
      state.statuses = [...POST_STATUSES]
    },
  },
})

export const { setStatuses, reset: resetPostsFilter } = postsFilterSlice.actions

export const selectStatusFilter = (state: { postsFilter: PostsFilterState }): PostStatus[] =>
  state.postsFilter.statuses
