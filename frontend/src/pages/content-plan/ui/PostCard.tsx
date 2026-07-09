import type { CSSProperties } from 'react'
import { Box, Group, Text, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import { NETWORKS } from '@/shared/config'
import { NetworkPill } from '@/shared/ui'
import type { Post } from '@/entities/scheduled-post'
import { BRAND } from '../lib/palette'
import classes from './PostCard.module.css'

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
      className={classes.card}
      onClick={onClick}
      title="Открыть настройки поста"
      style={
        {
          '--card-line': network ? `${network.color}59` : 'var(--mantine-color-gray-3)',
          '--card-soft': network ? `${network.color}14` : 'var(--mantine-color-gray-0)',
        } as CSSProperties
      }
    >
      <Group gap={5} wrap="nowrap">
        {network ? <NetworkPill network={network} variant="badge" size="cardSm" /> : null}
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
