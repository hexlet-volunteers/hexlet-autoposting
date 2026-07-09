import { useMemo } from 'react'
import { SimpleGrid, Skeleton, Stack, Text, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import type { Post } from '@/entities/scheduled-post'
import { BRAND, HINT_COLOR } from '../lib/palette'
import { capitalize } from '../lib/format'

interface QuarterCard {
  key: string
  name: string
  count: number
  /** «опубликовано» / «запланировано» / «пока пусто». */
  status: string
  isCurrent: boolean
}

interface QuarterViewProps {
  /** Посты, уже отфильтрованные по площадкам (квартал вырезается здесь). */
  posts: Post[]
  loading: boolean
  /** «Открыть месяц →» у текущего месяца. */
  onOpenMonth: () => void
}

/** Вид «Квартал»: три карточки-месяца текущего квартала с числом постов и статусом. */
export function QuarterView({ posts, loading, onOpenMonth }: QuarterViewProps) {
  const cards = useMemo<QuarterCard[]>(() => {
    const today = dayjs()
    // Сначала startOf('month') (1-е число), иначе month() 31-го числа перескочит месяц
    const quarterStart = today.startOf('month').month(Math.floor(today.month() / 3) * 3)
    return Array.from({ length: 3 }, (_, i) => {
      const month = quarterStart.add(i, 'month')
      const count = posts.filter((p) => dayjs(p.scheduledAt).isSame(month, 'month')).length
      const isPast = month.isBefore(today, 'month')
      return {
        key: month.format('YYYY-MM'),
        name: capitalize(month.format('MMMM')),
        count,
        status: count === 0 ? 'пока пусто' : isPast ? 'опубликовано' : 'запланировано',
        isCurrent: month.isSame(today, 'month'),
      }
    })
  }, [posts])

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={160} radius={16} />
        ))}
      </SimpleGrid>
    )
  }

  return (
    <Stack gap="sm">
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        {cards.map((card) => (
          <UnstyledButton
            key={card.key}
            onClick={card.isCurrent ? onOpenMonth : undefined}
            title={card.isCurrent ? 'Открыть месяц' : undefined}
            style={{
              background: 'var(--mantine-color-white)',
              border: card.isCurrent ? `1.5px solid ${BRAND}` : '1px solid rgba(23, 21, 15, 0.1)',
              borderRadius: 16,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              cursor: card.isCurrent ? 'pointer' : 'default',
              textAlign: 'left',
            }}
          >
            <Text fz={15} fw={700}>
              {card.name}
            </Text>
            <Text
              fz={34}
              fw={800}
              style={{
                letterSpacing: '-0.5px',
                color: card.isCurrent ? BRAND : 'rgba(23, 21, 15, 0.45)',
              }}
            >
              {card.count}
            </Text>
            <Text fz={12.5} style={{ color: 'rgba(23, 21, 15, 0.55)' }}>
              {card.status}
            </Text>
            {card.isCurrent ? (
              <Text fz={12.5} fw={700} mt={10} style={{ color: BRAND }}>
                Открыть месяц →
              </Text>
            ) : null}
          </UnstyledButton>
        ))}
      </SimpleGrid>
      <Text fz={12.5} style={{ color: HINT_COLOR }}>
        Подпись под числом — статус месяца: опубликовано / запланировано / пока пусто. «Открыть
        месяц →» ведёт к сетке текущего месяца
      </Text>
    </Stack>
  )
}
