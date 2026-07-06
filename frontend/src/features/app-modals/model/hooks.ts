import { useDispatch, useSelector } from 'react-redux'
import {
  closeComposer,
  closeConnectPlatform,
  closeUpgrade,
  openComposer,
  openConnectPlatform,
  openUpgrade,
  selectAppModals,
} from './appModalsSlice'

/** Доступ к состоянию и действиям глобальных модалок приложения. */
export function useAppModals() {
  const dispatch = useDispatch()
  const state = useSelector(selectAppModals)
  return {
    ...state,
    openComposer: (postId?: string) => dispatch(openComposer(postId)),
    closeComposer: () => dispatch(closeComposer()),
    openUpgrade: () => dispatch(openUpgrade()),
    closeUpgrade: () => dispatch(closeUpgrade()),
    openConnectPlatform: () => dispatch(openConnectPlatform()),
    closeConnectPlatform: () => dispatch(closeConnectPlatform()),
  }
}
