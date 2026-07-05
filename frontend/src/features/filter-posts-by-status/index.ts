export { StatusFilter } from './ui/StatusFilter'
export {
  postsFilterSlice,
  setStatuses,
  resetPostsFilter,
  selectStatusFilter,
} from './model/filterSlice'
export type { PostsFilterState } from './model/filterSlice'
export { useStatusFilter } from './model/hooks'
