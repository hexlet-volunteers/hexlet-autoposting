import { Card, Group, Stack, Text, Tooltip } from '@mantine/core'
import { IconCalendarClock, IconBrandTelegram } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { formatDateTime } from '@/shared/lib'
import type { Post } from '../model/types'
import { PostStatusBadge } from './PostStatusBadge'

interface PostCardProps {
  post: Post
  /** Feature-provided actions (edit / delete), injected by higher layers. */
  actions?: ReactNode
}

/** Presentational entity card — no data fetching, no business logic. */
export function PostCard({ post, actions }: PostCardProps) {
  return (
    <Card withBorder radius="md" padding="md">
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Text fw={600} lineClamp={1}>
            {post.title || 'Без названия'}
          </Text>
          <PostStatusBadge status={post.status} />
        </Group>

        <Text size="sm" c="dimmed" lineClamp={2}>
          {post.content}
        </Text>

        <Group gap="lg" mt={4}>
          <Group gap={4}>
            <IconCalendarClock size={14} />
            <Text size="xs" c="dimmed">
              {formatDateTime(post.scheduledFor)}
            </Text>
          </Group>
          {post.platformName ? (
            <Group gap={4}>
              <IconBrandTelegram size={14} />
              <Text size="xs" c="dimmed">
                {post.platformName}
              </Text>
            </Group>
          ) : null}
        </Group>

        {post.status === 'failed' && post.errorMessage ? (
          <Tooltip label={post.errorMessage} multiline w={260}>
            <Text size="xs" c="red" lineClamp={1}>
              {post.errorMessage}
            </Text>
          </Tooltip>
        ) : null}

        {actions ? (
          <Group justify="flex-end" gap="xs" mt={4}>
            {actions}
          </Group>
        ) : null}
      </Stack>
    </Card>
  )
}
