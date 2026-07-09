import { useDispatch, useSelector } from 'react-redux'
import { selectActiveNetworkIds, toggleNetwork } from './calendarFilterSlice'

/** Доступ к фильтру календаря: активные площадки и переключение (шаблон — features/app-modals). */
export function useCalendarFilter() {
  const dispatch = useDispatch()
  const activeNetworkIds = useSelector(selectActiveNetworkIds)
  return {
    activeNetworkIds,
    isNetworkActive: (networkId: string) => activeNetworkIds.includes(networkId),
    toggleNetwork: (networkId: string) => dispatch(toggleNetwork(networkId)),
  }
}
