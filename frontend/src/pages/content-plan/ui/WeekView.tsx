import { useMemo } from 'react'
import { Badge, Box, Group, SimpleGrid, Skeleton, Stack, Text, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import type { Post } from '@/entities/scheduled-post'
import { BORDER_SOFT, GRID_GAP_BG, HINT_COLOR, WEEKEND } from '../lib/palette'
import { PostCard } from './PostCard'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

interface DayColumn {
  key: string
  name: string
  date: string
  isToday: boolean
  isWeekend: boolean
  posts: Post[]
}

interface WeekViewProps {
  /** Посты недели, уже отфильтрованные по площадкам. */
  posts: Post[]
  /** Понедельник отображаемой недели. */
  weekStart: Dayjs
  loading: boolean
  onOpenPost: (id: string) => void
  onAdd: () => void
}

/** Недельная сетка контент-плана: 7 колонок-дней с карточками постов. */
export function WeekView({ posts, weekStart, loading, onOpenPost, onAdd }: WeekViewProps) {
  const days = useMemo<DayColumn[]>(() => {
    const today = dayjs()
    return Array.from({ length: 7 }, (_, i) => {
      const d = weekStart.add(i, 'day')
      return {
        key: d.format('YYYY-MM-DD'),
        name: WEEKDAYS[i],
        date: d.format('D'),
        isToday: d.isSame(today, 'day'),
        isWeekend: i >= 5,
        posts: posts
          .filter((p) => dayjs(p.scheduledAt).isSame(d, 'day'))
          .sort((a, b) => dayjs(a.scheduledAt).valueOf() - dayjs(b.scheduledAt).valueOf()),
      }
    })
  }, [posts, weekStart])

  if (loading) {
    return (
      <Box style={{ overflowX: 'auto' }}>
        <SimpleGrid cols={7} spacing="xs" style={{ minWidth: 720 }}>
          {WEEKDAYS.map((name) => (
            <Skeleton key={name} height={230} radius="md" />
          ))}
        </SimpleGrid>
      </Box>
    )
  }

  return (
    <Box
      style={{
        background: 'var(--mantine-color-white)',
        border: BORDER_SOFT,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <Box style={{ overflowX: 'auto' }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: 1,
            background: GRID_GAP_BG,
            minWidth: 720,
          }}
        >
          {days.map((day) => (
            <DayCell key={day.key} day={day} onOpenPost={onOpenPost} onAdd={onAdd} />
          ))}
        </Box>
      </Box>
      <Text fz={12} px={18} py={9} style={{ borderTop: BORDER_SOFT, color: HINT_COLOR }}>
        Клик по посту — настройки и удаление, «+» — новый пост в этот день, ↻ — повторяющийся пост
      </Text>
    </Box>
  )
}

interface DayCellProps {
  day: DayColumn
  onOpenPost: (id: string) => void
  onAdd: () => void
}

function DayCell({ day, onOpenPost, onAdd }: DayCellProps) {
  return (
    <Box
      style={{
        background: day.isToday ? 'rgba(43, 80, 236, 0.04)' : 'var(--mantine-color-white)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 230,
        minWidth: 0,
      }}
    >
      <Group gap={6} justify="center" px={4} pt={10} pb={8} wrap="nowrap">
        <Text
          size="sm"
          fw={600}
          style={{ color: day.isWeekend ? WEEKEND : 'rgba(23, 21, 15, 0.55)' }}
        >
          {day.name}
        </Text>
        <Text size="sm" c="dimmed">
          {day.date}
        </Text>
        {day.isToday ? (
          <Badge color="brand" size="xs" radius="pill">
            сегодня
          </Badge>
        ) : null}
      </Group>

      <Stack gap={6} px={6} pb={8} style={{ flex: 1 }}>
        {day.posts.map((post) => (
          <PostCard key={post.id} post={post} onClick={() => onOpenPost(post.id)} />
        ))}
        {day.posts.length === 0 ? (
          <Text fz={11} ta="center" c="dimmed">
            нет постов
          </Text>
        ) : null}
        <UnstyledButton
          onClick={onAdd}
          title="Новый пост в этот день"
          style={{
            border: '1.5px dashed rgba(23, 21, 15, 0.18)',
            borderRadius: 8,
            padding: 5,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(23, 21, 15, 0.4)',
          }}
        >
          +
        </UnstyledButton>
      </Stack>
    </Box>
  )
}
