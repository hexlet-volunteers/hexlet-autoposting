import { useSelector } from 'react-redux'
import { selectCurrentUserId } from './sessionSlice'

/** Convenience read hook for the current user id (client/session state). */
export function useCurrentUserId(): number {
  return useSelector(selectCurrentUserId)
}
