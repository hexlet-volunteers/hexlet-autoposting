import { useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import {
  Badge,
  Box,
  Group,
  Paper,
  Stack,
  Tabs,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import dayjs from 'dayjs'
import { NETWORKS } from '@/shared/config/networks'
import { EmptyState, NetworkPill } from '@/shared/ui'
import { useAppModals } from '@/features/app-modals'
import { useQueue } from '@/entities/scheduled-post'
import type { Post } from '@/entities/scheduled-post'
import { PostStatsModal } from './PostStatsModal'

const NETWORK_BY_ID = new Map(NETWORKS.map((n) => [n.id, n]))

/** Экран «Очередь»: вкладки «В очереди» и «Отправленные». */
export function QueuePage() {
  const { upcoming, sent } = useQueue()
  const { openComposer } = useAppModals()
  const [statsPost, setStatsPost] = useState<Post | null>(null)
  const [statsOpened, statsHandlers] = useDisclosure(false)

  const openStats = (post: Post) => {
    setStatsPost(post)
    statsHandlers.open()
  }

  return (
    <Stack gap="lg">
      <Title order={1} fw={800} style={{ letterSpacing: '-0.4px' }}>
        Очередь
      </Title>

      <Tabs defaultValue="upcoming">
        <Tabs.List>
          <Tabs.Tab value="upcoming">В очереди · {upcoming.length}</Tabs.Tab>
          <Tabs.Tab value="sent">Отправленные · {sent.length}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="upcoming" pt="md">
          <Paper withBorder radius="lg" style={{ overflow: 'hidden' }}>
            <Group gap="sm" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
              <Text fw={700}>Ближайшие публикации</Text>
              <Text size="sm" c="dimmed" style={{ marginLeft: 'auto' }}>
                клик по строке — настройки поста
              </Text>
            </Group>
            {upcoming.length === 0 ? (
              <EmptyState title="Очередь пуста" description="Запланируйте пост в контент-плане." />
            ) : (
              <Box style={{ overflowX: 'auto' }}>
                <Stack gap="xs" p="md" style={{ minWidth: 520 }}>
                  {upcoming.map((post) => (
                    <QueueRow key={post.id} post={post} onClick={() => openComposer(post.id)} />
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="sent" pt="md">
          <Paper withBorder radius="lg" style={{ overflow: 'hidden' }}>
            <Group gap="sm" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
              <Text fw={700}>Архив отправленных</Text>
              <Text size="sm" c="dimmed" style={{ marginLeft: 'auto' }}>
                клик по строке — статистика поста
              </Text>
            </Group>
            {sent.length === 0 ? (
              <EmptyState title="Пока ничего не отправлено" description="Здесь появятся опубликованные посты." />
            ) : (
              <Box style={{ overflowX: 'auto' }}>
                <Stack gap="xs" p="md" style={{ minWidth: 520 }}>
                  {sent.map((post) => (
                    <SentRow key={post.id} post={post} onClick={() => openStats(post)} />
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Tabs.Panel>
      </Tabs>

      <PostStatsModal post={statsPost} opened={statsOpened} onClose={statsHandlers.close} />
    </Stack>
  )
}

interface RowProps {
  post: Post
  onClick: () => void
}

function QueueRow({ post, onClick }: RowProps) {
  const network = NETWORK_BY_ID.get(post.networkIds[0])
  return (
    <UnstyledButton
      onClick={onClick}
      title="Открыть настройки поста"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        background: 'var(--mantine-color-gray-0)',
        border: '1px solid var(--mantine-color-gray-2)',
        borderRadius: 10,
        padding: '10px 14px',
      }}
    >
      {network ? <NetworkPill network={network} variant="badge" /> : null}
      <Text size="sm" fw={600} lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
        {post.title}
      </Text>
      <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
        {dayjs(post.scheduledAt).format('D MMM, HH:mm')}
      </Text>
    </UnstyledButton>
  )
}

function SentRow({ post, onClick }: RowProps) {
  const network = NETWORK_BY_ID.get(post.networkIds[0])
  return (
    <UnstyledButton
      onClick={onClick}
      title="Статистика поста"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        background: 'var(--mantine-color-gray-0)',
        border: '1px solid var(--mantine-color-gray-2)',
        borderRadius: 10,
        padding: '10px 14px',
      }}
    >
      {network ? <NetworkPill network={network} variant="badge" /> : null}
      <Text size="sm" fw={600} lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
        {post.title}
      </Text>
      <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
        {dayjs(post.scheduledAt).format('D MMM, HH:mm')}
      </Text>
      {post.metrics ? (
        <Text size="sm" fw={600} c="dimmed" style={{ flexShrink: 0 }}>
          {post.metrics.views.toLocaleString('ru-RU')}
        </Text>
      ) : null}
      <Badge color="teal" variant="light" radius="xl" style={{ flexShrink: 0 }}>
        опубликован
      </Badge>
    </UnstyledButton>
  )
}
