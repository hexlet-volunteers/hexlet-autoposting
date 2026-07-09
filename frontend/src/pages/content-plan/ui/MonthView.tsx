import { useMemo } from 'react'
import { Box, Skeleton, Text, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { NETWORKS } from '@/shared/config'
import type { Post } from '@/entities/scheduled-post'
import { BORDER_SOFT, BRAND, GRID_GAP_BG, HINT_COLOR, WEEKEND } from '../lib/palette'

const NETWORK_COLOR = new Map(NETWORKS.map((n) => [n.id, n.color]))
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
/** Сколько точек-постов показываем в ячейке дня, остальное сворачиваем в «+N». */
const MAX_DOTS = 3

interface DayCell {
  key: string
  /** Пустые ячейки-выравниватели до 1-го числа и после последнего. */
  date: Dayjs | null
  isToday: boolean
  dotColors: string[]
  more: string
}

interface MonthViewProps {
  /** Посты, уже отфильтрованные по площадкам (месяц вырезается здесь). */
  posts: Post[]
  /** Любой день отображаемого месяца. */
  month: Dayjs
  loading: boolean
  /** Клик по дню — открыть неделю этого дня. */
  onOpenWeek: (dateIso: string) => void
}

/** Вид «Месяц»: сетка 7×N, в ячейках — точки-посты цветом площадки и «+N» при переполнении. */
export function MonthView({ posts, month, loading, onOpenWeek }: MonthViewProps) {
  const { cells, total } = useMemo(() => {
    const monthStart = month.startOf('month')
    const byDay = new Map<string, Post[]>()
    let count = 0
    posts.forEach((p) => {
      const d = dayjs(p.scheduledAt)
      if (!d.isSame(monthStart, 'month')) return
      const key = d.format('YYYY-MM-DD')
      byDay.set(key, [...(byDay.get(key) ?? []), p])
      count += 1
    })

    const lead = (monthStart.day() + 6) % 7 // пустых ячеек до понедельника первой недели
    const result: DayCell[] = Array.from({ length: lead }, (_, i) => ({
      key: `lead-${i}`,
      date: null,
      isToday: false,
      dotColors: [],
      more: '',
    }))
    const today = dayjs()
    for (let d = 0; d < monthStart.daysInMonth(); d += 1) {
      const date = monthStart.add(d, 'day')
      const dayPosts = (byDay.get(date.format('YYYY-MM-DD')) ?? []).sort(
        (a, b) => dayjs(a.scheduledAt).valueOf() - dayjs(b.scheduledAt).valueOf(),
      )
      result.push({
        key: date.format('YYYY-MM-DD'),
        date,
        isToday: date.isSame(today, 'day'),
        dotColors: dayPosts
          .slice(0, MAX_DOTS)
          .map((p) => NETWORK_COLOR.get(p.networkIds[0]) ?? 'var(--mantine-color-gray-5)'),
        more: dayPosts.length > MAX_DOTS ? `+${dayPosts.length - MAX_DOTS}` : '',
      })
    }
    while (result.length % 7 !== 0) {
      result.push({
        key: `tail-${result.length}`,
        date: null,
        isToday: false,
        dotColors: [],
        more: '',
      })
    }
    return { cells: result, total: count }
  }, [posts, month])

  if (loading) {
    return <Skeleton height={480} radius={16} />
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
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: BORDER_SOFT,
        }}
      >
        {WEEKDAYS.map((name, i) => (
          <Text
            key={name}
            fz={11.5}
            fw={600}
            ta="center"
            py={9}
            style={{ color: i >= 5 ? WEEKEND : 'rgba(23, 21, 15, 0.5)' }}
          >
            {name}
          </Text>
        ))}
      </Box>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: 1,
          background: GRID_GAP_BG,
        }}
      >
        {cells.map((cell) => {
          const { date } = cell
          return (
            <MonthDayCell
              key={cell.key}
              cell={cell}
              onOpen={date ? () => onOpenWeek(date.toISOString()) : undefined}
            />
          )
        })}
      </Box>
      {total === 0 ? (
        <Text ta="center" c="dimmed" size="sm" py="md">
          В этом месяце пока нет постов — нажмите «Новый пост», чтобы запланировать первый
        </Text>
      ) : null}
      <Text fz={12} px={18} py={9} style={{ borderTop: BORDER_SOFT, color: HINT_COLOR }}>
        Точки — запланированные посты. Клик по дню открывает его неделю
      </Text>
    </Box>
  )
}

interface MonthDayCellProps {
  cell: DayCell
  onOpen?: () => void
}

function MonthDayCell({ cell, onOpen }: MonthDayCellProps) {
  return (
    <UnstyledButton
      onClick={onOpen}
      title={cell.date ? 'Открыть неделю этого дня' : undefined}
      style={{
        background: 'var(--mantine-color-white)',
        outline: cell.isToday ? `2px solid ${BRAND}` : 'none',
        outlineOffset: -2,
        minHeight: 86,
        padding: '8px 9px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 7,
        cursor: cell.date ? 'pointer' : 'default',
      }}
    >
      <Text fz={12} fw={600} style={{ color: cell.isToday ? BRAND : 'rgba(23, 21, 15, 0.7)' }}>
        {cell.date ? cell.date.date() : ''}
      </Text>
      <Box style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {cell.dotColors.map((color, i) => (
          <Box
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 'var(--mantine-radius-pill)',
              background: color,
            }}
          />
        ))}
        {cell.more ? (
          <Text fz={10} fw={700} style={{ color: 'rgba(23, 21, 15, 0.45)' }}>
            {cell.more}
          </Text>
        ) : null}
      </Box>
    </UnstyledButton>
  )
}
