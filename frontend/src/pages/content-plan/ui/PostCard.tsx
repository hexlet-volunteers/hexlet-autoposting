import { Badge, Box, Group, Text, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import { NETWORKS } from '@/shared/config'
import { NetworkPill } from '@/shared/ui'
import type { Post } from '@/entities/scheduled-post'
import { BRAND } from '../lib/palette'

const NETWORK_BY_ID = new Map(NETWORKS.map((n) => [n.id, n]))

interface PostCardProps {
  post: Post
  onClick: () => void
}

/**
 * Карточка поста в недельной сетке: бейдж площадки, время, «↻» у повторяющихся,
 * заголовок в одну строку и плашка «N фото» при прикреплённых медиа.
 * Мягкий фон и рамка — цвет первой площадки с прозрачностью (как в макете).
 */
export function PostCard({ post, onClick }: PostCardProps) {
  const network = NETWORK_BY_ID.get(post.networkIds[0])
  const time = dayjs(post.scheduledAt).format('HH:mm')
  return (
    <UnstyledButton
      onClick={onClick}
      title="Открыть настройки поста"
      style={{
        border: `1px solid ${network ? `${network.color}59` : 'var(--mantine-color-gray-3)'}`,
        borderRadius: 8,
        padding: '6px 7px',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        background: network ? `${network.color}14` : 'var(--mantine-color-gray-0)',
      }}
    >
      <Group gap={5} wrap="nowrap">
        {network ? <NetworkPill network={network} variant="badge" /> : null}
        <Text size="xs" fw={600} c="dimmed">
          {time}
        </Text>
        {post.isRecurring ? (
          <Text
            component="span"
            fz={11}
            fw={700}
            title="Повторяющийся пост"
            style={{ color: BRAND, flex: 'none' }}
          >
            ↻
          </Text>
        ) : null}
        {post.status === 'draft' ? (
          <Badge size="xs" variant="light" color="gray" radius="sm">
            черновик
          </Badge>
        ) : null}
      </Group>
      <Text size="xs" fw={600} lineClamp={1} style={{ color: 'var(--mantine-color-text)' }}>
        {post.title}
      </Text>
      {post.mediaCount ? (
        <Box
          component="span"
          style={{
            alignSelf: 'flex-start',
            fontSize: 9,
            fontWeight: 700,
            color: 'rgba(23, 21, 15, 0.55)',
            background: 'rgba(23, 21, 15, 0.07)',
            borderRadius: 4,
            padding: '1px 5px',
          }}
        >
          {post.mediaCount} фото
        </Box>
      ) : null}
    </UnstyledButton>
  )
}
