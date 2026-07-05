import { Chip, Group } from '@mantine/core'
import { useDispatch } from 'react-redux'
import { POST_STATUSES, POST_STATUS_LABEL } from '@/shared/config/postStatus'
import type { PostStatus } from '@/shared/config/postStatus'
import { setStatuses } from '../model/filterSlice'
import { useStatusFilter } from '../model/hooks'

/** Multi-select chips controlling which status columns are visible. */
export function StatusFilter() {
  const dispatch = useDispatch()
  const statuses = useStatusFilter()

  return (
    <Chip.Group
      multiple
      value={statuses}
      onChange={(value) => dispatch(setStatuses(value as PostStatus[]))}
    >
      <Group gap="xs">
        {POST_STATUSES.map((status) => (
          <Chip key={status} value={status} size="sm" variant="outline">
            {POST_STATUS_LABEL[status]}
          </Chip>
        ))}
      </Group>
    </Chip.Group>
  )
}
