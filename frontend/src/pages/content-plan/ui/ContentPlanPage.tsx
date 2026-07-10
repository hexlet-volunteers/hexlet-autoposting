import { usePageMeta } from '@/shared/lib'
import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Group,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useAppModals } from '@/features/app-modals'
import { isInWeek, startOfWeekMonday, useContentPlan } from '@/entities/scheduled-post'
import { useQuota } from '@/entities/subscription'
import { BORDER_PANEL, BRAND, BRAND_SOFT_BG, INK } from '../lib/palette'
import { capitalize, postCountLabel } from '../lib/format'
import { PlatformChips } from './PlatformChips'
import { WeekView } from './WeekView'
import { MonthView } from './MonthView'
import { QuarterView } from './QuarterView'
import { YearView } from './YearView'

type Scale = 'week' | 'month' | 'quarter' | 'year'

const SCALE_OPTIONS: { label: string; value: Scale }[] = [
  { label: 'Неделя', value: 'week' },
  { label: 'Месяц', value: 'month' },
  { label: 'Квартал', value: 'quarter' },
  { label: 'Год', value: 'year' },
]

/** Экран «Контент-план»: масштабы Неделя/Месяц/Квартал/Год на общем списке постов. */
export function ContentPlanPage() {
  usePageMeta({
    title: 'Календарь — Отложка',
    description: 'Контент-план проекта в Отложке.',
    noindex: true,
  })
  const [scale, setScale] = useState<Scale>('week')
  // Смещение отображаемой недели от текущей (стрелки «‹ / ›» двигают на ±1)
  const [weekOffset, setWeekOffset] = useState(0)
  const [calYear, setCalYear] = useState(() => dayjs().year())
  const { openComposer } = useAppModals()
  const postsQuota = useQuota('posts')
  const { data: posts, isLoading } = useContentPlan()

  const weekStart = useMemo(() => startOfWeekMonday(dayjs()).add(weekOffset, 'week'), [weekOffset])
  // Вид «Месяц» всегда показывает текущий месяц (стабильная ссылка для мемоизации)
  const currentMonth = useMemo(() => dayjs().startOf('month'), [])
  const weekPosts = useMemo(
    () => posts.filter((p) => isInWeek(dayjs(p.scheduledAt), weekStart)),
    [posts, weekStart],
  )

  const weekEnd = weekStart.add(6, 'day')
  const weekLabel =
    weekStart.month() === weekEnd.month()
      ? `${weekStart.format('D')}–${weekEnd.format('D MMMM')}`
      : `${weekStart.format('D MMMM')} – ${weekEnd.format('D MMMM')}`
  const periodLabel =
    scale === 'month'
      ? capitalize(dayjs().format('MMMM YYYY'))
      : `${Math.floor(dayjs().month() / 3) + 1}-й квартал ${dayjs().year()}`

  // Клик по дню месяца открывает неделю этого дня
  const openWeekOf = (dateIso: string) => {
    const target = startOfWeekMonday(dayjs(dateIso))
    setWeekOffset(target.diff(startOfWeekMonday(dayjs()), 'week'))
    setScale('week')
  }

  return (
    <Stack gap="lg">
      <Group gap="md" wrap="wrap" align="center">
        <Title order={1} fw={800} style={{ letterSpacing: '-0.4px' }}>
          Календарь
        </Title>
        <SegmentedControl
          value={scale}
          onChange={(v) => setScale(v as Scale)}
          data={SCALE_OPTIONS}
          // Активный чип — тёмная заливка с белым текстом (макет app-dashboard)
          color={INK}
          radius={8}
          styles={{
            root: { background: 'var(--mantine-color-white)', border: BORDER_PANEL },
          }}
        />
        {scale === 'week' ? (
          <>
            <ArrowNav
              label={weekLabel}
              minWidth={126}
              prevTitle="Предыдущая неделя"
              nextTitle="Следующая неделя"
              onPrev={() => setWeekOffset((w) => w - 1)}
              onNext={() => setWeekOffset((w) => w + 1)}
            />
            {isLoading ? (
              <Skeleton height={26} width={78} radius="pill" />
            ) : (
              <Box
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: BRAND,
                  background: BRAND_SOFT_BG,
                  borderRadius: 'var(--mantine-radius-pill)',
                  padding: '5px 11px',
                }}
              >
                {postCountLabel(weekPosts.length)}
              </Box>
            )}
          </>
        ) : null}
        {scale === 'month' || scale === 'quarter' ? (
          <Text
            fz={13.5}
            fw={700}
            px={14}
            py={9}
            style={{
              background: 'var(--mantine-color-white)',
              border: BORDER_PANEL,
              borderRadius: 11,
            }}
          >
            {periodLabel}
          </Text>
        ) : null}
        {scale === 'year' ? (
          <ArrowNav
            label={String(calYear)}
            minWidth={60}
            prevTitle="Предыдущий год"
            nextTitle="Следующий год"
            onPrev={() => setCalYear((y) => y - 1)}
            onNext={() => setCalYear((y) => y + 1)}
          />
        ) : null}
        <Box style={{ flex: 1 }} />
        {/* Мягкий enforcement квоты постов (#211): при исчерпании кнопка
            неактивна, тултип объясняет причину. data-disabled вместо disabled,
            чтобы Tooltip продолжал работать. */}
        <Tooltip
          label="Достигнут лимит постов тарифа — улучшите тариф, чтобы планировать больше"
          disabled={!postsQuota.exhausted}
        >
          <Button
            leftSection={<IconPlus size={16} />}
            data-disabled={postsQuota.exhausted || undefined}
            onClick={(event) => {
              if (postsQuota.exhausted) {
                event.preventDefault()
                return
              }
              openComposer()
            }}
          >
            Новый пост
          </Button>
        </Tooltip>
      </Group>

      <PlatformChips />

      {scale === 'week' ? (
        <WeekView
          posts={weekPosts}
          weekStart={weekStart}
          loading={isLoading}
          onOpenPost={openComposer}
          onAdd={() => openComposer()}
        />
      ) : null}
      {scale === 'month' ? (
        <MonthView posts={posts} month={currentMonth} loading={isLoading} onOpenWeek={openWeekOf} />
      ) : null}
      {scale === 'quarter' ? (
        <QuarterView posts={posts} loading={isLoading} onOpenMonth={() => setScale('month')} />
      ) : null}
      {scale === 'year' ? (
        <YearView
          posts={posts}
          year={calYear}
          loading={isLoading}
          onOpenMonth={() => setScale('month')}
        />
      ) : null}
    </Stack>
  )
}

interface ArrowNavProps {
  label: string
  minWidth: number
  prevTitle: string
  nextTitle: string
  onPrev: () => void
  onNext: () => void
}

/** Панель «‹ подпись ›» для навигации по неделям и годам (из макета). */
function ArrowNav({ label, minWidth, prevTitle, nextTitle, onPrev, onNext }: ArrowNavProps) {
  const arrowStyle = {
    padding: '6px 10px',
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 1,
    color: 'rgba(23, 21, 15, 0.6)',
  }
  return (
    <Group
      gap={6}
      wrap="nowrap"
      style={{
        background: 'var(--mantine-color-white)',
        border: BORDER_PANEL,
        borderRadius: 11,
        padding: 4,
      }}
    >
      <UnstyledButton onClick={onPrev} title={prevTitle} aria-label={prevTitle} style={arrowStyle}>
        ‹
      </UnstyledButton>
      <Text fz={13.5} fw={700} ta="center" style={{ minWidth }}>
        {label}
      </Text>
      <UnstyledButton onClick={onNext} title={nextTitle} aria-label={nextTitle} style={arrowStyle}>
        ›
      </UnstyledButton>
    </Group>
  )
}
