import { Badge } from '@mantine/core'
import { POST_STATUS_COLOR, POST_STATUS_LABEL } from '@/shared/config/postStatus'
import type { PostStatus } from '@/shared/config/postStatus'

export function PostStatusBadge({ status }: { status: PostStatus }) {
  return (
    <Badge color={POST_STATUS_COLOR[status]} variant="light">
      {POST_STATUS_LABEL[status]}
    </Badge>
  )
}
