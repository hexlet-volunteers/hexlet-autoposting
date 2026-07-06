import { useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { IconLink, IconPlus } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { NETWORKS } from '@/shared/config/networks'
import { NetworkPill } from '@/shared/ui'
import { useAppModals } from '@/features/app-modals'
import { useContentPlan } from '@/entities/scheduled-post'
import type { Post } from '@/entities/scheduled-post'

const NETWORK_BY_ID = new Map(NETWORKS.map((n) => [n.id, n]))
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

interface DayColumn {
  key: string
  name: string
  date: string
  isToday: boolean
  posts: Post[]
}

/** Экран «Контент-план»: недельная сетка запланированных постов. */
export function ContentPlanPage() {
  const [scale, setScale] = useState<'week' | 'month'>('week')
  const { openComposer, openConnectPlatform } = useAppModals()
  const { data: posts } = useContentPlan()

  const days = useMemo<DayColumn[]>(() => {
    const weekStart = dayjs().startOf('week').add(1, 'day')
    const today = dayjs()
    return Array.from({ length: 7 }, (_, i) => {
      const d = weekStart.add(i, 'day')
      return {
        key: d.format('YYYY-MM-DD'),
        name: WEEKDAYS[i],
        date: d.format('D MMM'),
        isToday: d.isSame(today, 'day'),
        posts: posts
          .filter((p) => dayjs(p.scheduledAt).isSame(d, 'day'))
          .sort((a, b) => dayjs(a.scheduledAt).valueOf() - dayjs(b.scheduledAt).valueOf()),
      }
    })
  }, [posts])

  return (
    <Stack gap="lg">
      <Group gap="md" wrap="wrap" align="center">
        <Title order={1} fw={800} style={{ letterSpacing: '-0.4px' }}>
          Контент-план
        </Title>
        <SegmentedControl
          value={scale}
          onChange={(v) => setScale(v as 'week' | 'month')}
          data={[
            { label: 'Неделя', value: 'week' },
            { label: 'Месяц', value: 'month' },
          ]}
        />
        <Box style={{ flex: 1 }} />
        <Group gap="sm">
          <Button
            variant="default"
            leftSection={<IconLink size={16} />}
            onClick={() => openConnectPlatform()}
          >
            Подключить площадку
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => openComposer()}>
            Новый пост
          </Button>
        </Group>
      </Group>

      <Box style={{ overflowX: 'auto' }}>
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 7 }} spacing="xs" style={{ minWidth: 720 }}>
          {days.map((day) => (
            <DayCard key={day.key} day={day} onOpenPost={openComposer} onAdd={() => openComposer()} />
          ))}
        </SimpleGrid>
      </Box>

      <Text size="sm" c="dimmed">
        Клик по посту — настройки и удаление, «+» — новый пост в этот день
      </Text>
    </Stack>
  )
}

interface DayCardProps {
  day: DayColumn
  onOpenPost: (id: string) => void
  onAdd: () => void
}

function DayCard({ day, onOpenPost, onAdd }: DayCardProps) {
  return (
    <Paper withBorder radius="md" p="xs" style={{ minHeight: 230, display: 'flex', flexDirection: 'column' }}>
      <Group gap={6} justify="center" mb="xs">
        <Text size="sm" fw={600} c={day.isToday ? 'brand' : undefined}>
          {day.name}
        </Text>
        <Text size="sm" c="dimmed">
          {day.date}
        </Text>
        {day.isToday ? (
          <Badge color="brand" size="xs" radius="sm">
            сегодня
          </Badge>
        ) : null}
      </Group>

      <Stack gap={6} style={{ flex: 1 }}>
        {day.posts.map((post) => (
          <PostCard key={post.id} post={post} onClick={() => onOpenPost(post.id)} />
        ))}
        <UnstyledButton
          onClick={onAdd}
          style={{
            border: '1.5px dashed var(--mantine-color-gray-4)',
            borderRadius: 8,
            padding: 5,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--mantine-color-dimmed)',
          }}
        >
          +
        </UnstyledButton>
      </Stack>
    </Paper>
  )
}

interface PostCardProps {
  post: Post
  onClick: () => void
}

function PostCard({ post, onClick }: PostCardProps) {
  const network = NETWORK_BY_ID.get(post.networkIds[0])
  const time = dayjs(post.scheduledAt).format('HH:mm')
  return (
    <UnstyledButton
      onClick={onClick}
      title="Открыть настройки поста"
      style={{
        border: '1px solid var(--mantine-color-gray-3)',
        borderRadius: 8,
        padding: '6px 7px',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        background: 'var(--mantine-color-gray-0)',
      }}
    >
      <Group gap={5} wrap="nowrap">
        {network ? <NetworkPill network={network} variant="badge" /> : null}
        <Text size="xs" fw={600} c="dimmed">
          {time}
        </Text>
        {post.status === 'draft' ? (
          <Badge size="xs" variant="light" color="gray" radius="sm">
            черновик
          </Badge>
        ) : null}
      </Group>
      <Text
        size="xs"
        fw={600}
        lineClamp={1}
        style={{ color: 'var(--mantine-color-text)' }}
      >
        {post.title}
      </Text>
    </UnstyledButton>
  )
}
