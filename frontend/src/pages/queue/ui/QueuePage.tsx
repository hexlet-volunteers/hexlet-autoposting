import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useDisclosure } from '@mantine/hooks'
import {
  Box,
  Group,
  Paper,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import dayjs from 'dayjs'
import { NETWORKS } from '@/shared/config'
import { EmptyState, NetworkPill } from '@/shared/ui'
import { useAppModals } from '@/features/app-modals'
import { useQueue } from '@/entities/scheduled-post'
import type { Post } from '@/entities/scheduled-post'
import { PostStatsModal } from './PostStatsModal'
import classes from './QueuePage.module.css'

const NETWORK_BY_ID = new Map(NETWORKS.map((n) => [n.id, n]))

/** Период фильтрации списков очереди (неделя ⊂ месяц ⊂ квартал ⊂ год). */
type QueuePeriod = 'week' | 'month' | 'quarter' | 'year'

const PERIOD_OPTIONS: { value: QueuePeriod; label: string }[] = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'year', label: 'Год' },
]

/** Границы периодов в днях от текущего момента. */
const PERIOD_DAYS: Record<QueuePeriod, number> = { week: 7, month: 31, quarter: 92, year: 366 }

/** Пост попадает в период, если его дата не дальше границы от «сейчас» (в обе стороны). */
function isWithinPeriod(post: Post, period: QueuePeriod): boolean {
  return Math.abs(dayjs(post.scheduledAt).diff(dayjs(), 'day')) <= PERIOD_DAYS[period]
}

/** Сокращённые дни недели с заглавной буквы — формат времени очереди «Пн, 09:00». */
const WEEKDAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

function formatQueueTime(iso: string): string {
  const date = dayjs(iso)
  return `${WEEKDAYS_SHORT[date.day()]}, ${date.format('HH:mm')}`
}

/** Сокращённые месяцы для метки недели («10–16 ноя»). */
const MONTHS_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
]

/** Диапазон ISO-недели поста: «10–16 ноя», на стыке месяцев — «29 июн – 5 июл». */
function formatWeekLabel(iso: string): string {
  const date = dayjs(iso)
  // Понедельник вычисляем явно, не полагаясь на weekStart текущей локали dayjs.
  const monday = date.subtract((date.day() + 6) % 7, 'day')
  const sunday = monday.add(6, 'day')
  if (monday.month() === sunday.month()) {
    return `${monday.date()}–${sunday.date()} ${MONTHS_SHORT[sunday.month()]}`
  }
  return `${monday.date()} ${MONTHS_SHORT[monday.month()]} – ${sunday.date()} ${MONTHS_SHORT[sunday.month()]}`
}

/** Сокращённые дни недели строчными — формат даты архива «чт, 31 окт · 12:00». */
const WEEKDAYS_SHORT_LOWER = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

/**
 * Дата строки архива по макету: «чт, 31 окт · 12:00»; год добавляется только
 * для прошлых лет, чтобы посты разных лет не были неоднозначными: «вт, 31 дек 2025 · 12:00».
 */
function formatSentDate(iso: string): string {
  const date = dayjs(iso)
  const weekday = WEEKDAYS_SHORT_LOWER[date.day()]
  const year = date.year() === dayjs().year() ? '' : ` ${date.year()}`
  return `${weekday}, ${date.date()} ${MONTHS_SHORT[date.month()]}${year} · ${date.format('HH:mm')}`
}

/** Общий стиль строки списка по макету: кремовая подложка, скругление 10. */
const ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 11,
  width: '100%',
  background: '#F6F4EF',
  border: '1px solid rgba(23, 21, 15, 0.07)',
  borderRadius: 10,
  padding: '10px 14px',
}

/** Экран «Очередь»: вкладки «В очереди» и «Отправленные». */
export function QueuePage() {
  const queue = useQueue()
  // Флаг загрузки появится в useQueue после перевода мока на асинхронную выборку
  // (задача по entities/scheduled-post); до неё поле отсутствует и флаг всегда false.
  const {
    upcoming,
    sent,
    isLoading = false,
  } = queue as ReturnType<typeof useQueue> & { isLoading?: boolean }
  const { openComposer } = useAppModals()
  const [statsPost, setStatsPost] = useState<Post | null>(null)
  const [statsOpened, statsHandlers] = useDisclosure(false)
  // Период — отдельный для каждой карточки (как в макете: queuePer / archPer).
  const [upcomingPeriod, setUpcomingPeriod] = useState<QueuePeriod>('week')
  const [sentPeriod, setSentPeriod] = useState<QueuePeriod>('week')

  // Фильтр по периоду живёт на странице: мок useQueue пока не принимает параметров
  // (переход на выборку с периодом — задача по entities/scheduled-post).
  const upcomingFiltered = upcoming.filter((post) => isWithinPeriod(post, upcomingPeriod))
  const sentFiltered = sent.filter((post) => isWithinPeriod(post, sentPeriod))

  const openStats = (post: Post) => {
    setStatsPost(post)
    statsHandlers.open()
  }

  return (
    <Stack gap="lg">
      <Title order={1} fw={800} style={{ letterSpacing: '-0.4px' }}>
        Очередь
      </Title>

      <Tabs
        defaultValue="upcoming"
        variant="pills"
        classNames={{ list: classes.tabsList, tab: classes.tab }}
      >
        <Tabs.List>
          <Tabs.Tab value="upcoming">В очереди · {upcomingFiltered.length}</Tabs.Tab>
          <Tabs.Tab value="sent">Отправленные · {sentFiltered.length}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="upcoming" pt="md">
          <Paper withBorder radius="lg" style={{ overflow: 'hidden' }}>
            <Group
              gap="sm"
              p="md"
              style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
            >
              <Text fw={700}>Ближайшие публикации</Text>
              <PeriodChips value={upcomingPeriod} onChange={setUpcomingPeriod} />
              <Text size="sm" c="dimmed" style={{ marginLeft: 'auto' }}>
                клик по строке — настройки поста
              </Text>
            </Group>
            {isLoading ? (
              <RowsSkeleton />
            ) : upcomingFiltered.length === 0 ? (
              <EmptyState
                title="Пока нет запланированных публикаций"
                description="Запланируйте пост в контент-плане."
              />
            ) : (
              <Box style={{ overflowX: 'auto' }}>
                <Stack gap="xs" p="md" style={{ minWidth: 520 }}>
                  {upcomingFiltered.map((post) => (
                    <QueueRow key={post.id} post={post} onClick={() => openComposer(post.id)} />
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="sent" pt="md">
          <Paper withBorder radius="lg" style={{ overflow: 'hidden' }}>
            <Group
              gap="sm"
              p="md"
              style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
            >
              <Text fw={700}>Архив отправленных</Text>
              <PeriodChips value={sentPeriod} onChange={setSentPeriod} />
              <Text size="sm" c="dimmed" style={{ marginLeft: 'auto' }}>
                клик по строке — статистика поста
              </Text>
            </Group>
            {isLoading ? (
              <RowsSkeleton />
            ) : sentFiltered.length === 0 ? (
              <EmptyState title="Архив пуст" description="Здесь появятся опубликованные посты." />
            ) : (
              <Box style={{ overflowX: 'auto' }}>
                <Stack gap="xs" p="md" style={{ minWidth: 520 }}>
                  {sentFiltered.map((post) => (
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

interface PeriodChipsProps {
  value: QueuePeriod
  onChange: (value: QueuePeriod) => void
}

/** Фильтр-чипы периода «Неделя / Месяц / Квартал / Год» в шапке карточки. */
function PeriodChips({ value, onChange }: PeriodChipsProps) {
  return (
    <Group
      gap={3}
      p={3}
      wrap="nowrap"
      style={{ background: 'rgba(23, 21, 15, 0.05)', borderRadius: 9 }}
    >
      {PERIOD_OPTIONS.map((option) => {
        const active = option.value === value
        return (
          <UnstyledButton
            key={option.value}
            onClick={() => onChange(option.value)}
            style={{
              borderRadius: 7,
              padding: '5px 11px',
              fontSize: 11.5,
              fontWeight: 600,
              background: active ? '#17150F' : 'transparent',
              color: active ? '#fff' : 'rgba(23, 21, 15, 0.7)',
            }}
          >
            {option.label}
          </UnstyledButton>
        )
      })}
    </Group>
  )
}

/** Строки-скелетоны на время загрузки списка. */
function RowsSkeleton() {
  return (
    <Stack gap="xs" p="md">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} height={44} radius={10} />
      ))}
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
    <UnstyledButton onClick={onClick} title="Открыть настройки поста" style={ROW_STYLE}>
      {network ? <NetworkPill network={network} variant="badge" /> : null}
      <Text size="sm" fw={600} lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
        {post.title}
      </Text>
      <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
        {formatQueueTime(post.scheduledAt)}
      </Text>
      <Text
        component="span"
        fz={11}
        fw={600}
        style={{
          flexShrink: 0,
          color: 'rgba(23, 21, 15, 0.45)',
          background: 'rgba(23, 21, 15, 0.06)',
          borderRadius: 'var(--mantine-radius-pill)',
          padding: '3px 9px',
        }}
      >
        {formatWeekLabel(post.scheduledAt)}
      </Text>
    </UnstyledButton>
  )
}

function SentRow({ post, onClick }: RowProps) {
  const network = NETWORK_BY_ID.get(post.networkIds[0])
  return (
    <UnstyledButton onClick={onClick} title="Статистика поста" style={ROW_STYLE}>
      {network ? <NetworkPill network={network} variant="badge" /> : null}
      <Text size="sm" fw={600} lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
        {post.title}
      </Text>
      <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
        {formatSentDate(post.scheduledAt)}
      </Text>
      {post.metrics ? (
        <Text size="sm" fw={600} c="dimmed" style={{ flexShrink: 0 }}>
          {post.metrics.views.toLocaleString('ru-RU')}
        </Text>
      ) : null}
      <Text
        component="span"
        fz={11}
        fw={700}
        style={{
          flexShrink: 0,
          color: '#1E7F4F',
          background: 'rgba(34, 160, 107, 0.12)',
          borderRadius: 'var(--mantine-radius-pill)',
          padding: '3px 9px',
        }}
      >
        опубликован
      </Text>
    </UnstyledButton>
  )
}
