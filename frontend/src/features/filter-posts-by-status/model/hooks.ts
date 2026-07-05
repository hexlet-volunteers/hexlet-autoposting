import { useSelector } from 'react-redux'
import { selectStatusFilter } from './filterSlice'
import type { PostStatus } from '@/shared/config/postStatus'

export function useStatusFilter(): PostStatus[] {
  return useSelector(selectStatusFilter)
}
