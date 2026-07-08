import { useMemo } from 'react'
import { Box, SimpleGrid, Skeleton, Stack, Text, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import type { Post } from '@/entities/scheduled-post'
import { BRAND, HINT_COLOR, INK } from '../lib/palette'
import { MONTHS_DATIVE, MONTHS_SHORT, postCountLabel } from '../lib/format'

/** Максимальная высота столбика в плитке месяца (из макета). */
const MAX_BAR_HEIGHT = 38
const MIN_BAR_HEIGHT = 4

interface YearTile {
  key: string
  name: string
  count: number
  barHeight: number
  /** Текущий месяц текущего года — синий бар, рамка и клик в «Месяц». */
  isCurrent: boolean
}

interface YearViewProps {
  /** Посты, уже отфильтрованные по площадкам (год вырезается здесь). */
  posts: Post[]
  /** Отображаемый год (навигация «‹ 2026 ›» — в шапке страницы). */
  year: number
  loading: boolean
  /** Клик по плитке текущего месяца — открыть вид «Месяц». */
  onOpenMonth: () => void
}

/** Вид «Год»: 12 плиток-месяцев со столбиком, пропорциональным числу постов. */
export function YearView({ posts, year, loading, onOpenMonth }: YearViewProps) {
  const today = dayjs()
  const isCurrentYear = year === today.year()

  const tiles = useMemo<YearTile[]>(() => {
    const counts = Array.from({ length: 12 }, () => 0)
    posts.forEach((p) => {
      const d = dayjs(p.scheduledAt)
      if (d.year() === year) counts[d.month()] += 1
    })
    const max = Math.max(...counts, 1)
    return counts.map((count, month) => ({
      key: `${year}-${month}`,
      name: MONTHS_SHORT[month],
      count,
      barHeight:
        count === 0
          ? MIN_BAR_HEIGHT
          : Math.max(MIN_BAR_HEIGHT, Math.round((count / max) * MAX_BAR_HEIGHT)),
      isCurrent: isCurrentYear && month === today.month(),
    }))
  }, [posts, year, isCurrentYear, today])

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, lg: 6 }} spacing={12}>
        {MONTHS_SHORT.map((name) => (
          <Skeleton key={name} height={110} radius={14} />
        ))}
      </SimpleGrid>
    )
  }

  const yearTotal = tiles.reduce((sum, t) => sum + t.count, 0)
  const hint = isCurrentYear
    ? `Высота столбика — число публикаций. Клик по ${MONTHS_DATIVE[today.month()]} откроет месяц`
    : yearTotal > 0
      ? `Архивный год: данные по опубликованным постам. Стрелками — к ${today.year()}`
      : `За ${year} год постов нет. Стрелками — к ${today.year()}`

  return (
    <Stack gap="sm">
      <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, lg: 6 }} spacing={12}>
        {tiles.map((tile) => (
          <UnstyledButton
            key={tile.key}
            onClick={tile.isCurrent ? onOpenMonth : undefined}
            title={tile.isCurrent ? 'Открыть месяц' : undefined}
            style={{
              background: 'var(--mantine-color-white)',
              border: tile.isCurrent ? `1.5px solid ${BRAND}` : '1px solid rgba(23, 21, 15, 0.1)',
              borderRadius: 14,
              padding: '14px 14px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              cursor: tile.isCurrent ? 'pointer' : 'default',
              textAlign: 'left',
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'flex-end', height: MAX_BAR_HEIGHT }}>
              <Box
                style={{
                  width: 26,
                  height: tile.barHeight,
                  borderRadius: '5px 5px 2px 2px',
                  background: tile.isCurrent ? BRAND : 'rgba(23, 21, 15, 0.14)',
                }}
              />
            </Box>
            <Text fz={13} fw={700} mt={8} style={{ color: tile.isCurrent ? BRAND : INK }}>
              {tile.name}
            </Text>
            <Text fz={12} style={{ color: 'rgba(23, 21, 15, 0.5)' }}>
              {postCountLabel(tile.count)}
            </Text>
          </UnstyledButton>
        ))}
      </SimpleGrid>
      <Text fz={12.5} style={{ color: HINT_COLOR }}>
        {hint}
      </Text>
    </Stack>
  )
}
