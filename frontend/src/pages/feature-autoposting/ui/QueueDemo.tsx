import { useState } from 'react'
import { Badge, Card, Group, Stack, Text, UnstyledButton } from '@mantine/core'
import { NETWORKS } from '@/shared/config'
import { plural } from '../lib/plural'

const BORDER = 'rgba(23,21,15,.1)'
const SOFT_BORDER = 'rgba(23,21,15,.09)'

interface QueueItem {
  /** Уникальный ключ для React (посты из заготовок могут повторяться). */
  id: string
  /** Индекс сети в общем справочнике NETWORKS (shared/config). */
  networkIndex: number
  label: string
  when: string
  /** true — пост уже опубликован, false — ещё ждёт в очереди. */
  done: boolean
}

// Стартовая очередь — как в макете feature-autoposting: два поста опубликованы, три ждут.
const INITIAL_QUEUE: QueueItem[] = [
  { id: 'seed-1', networkIndex: 0, label: 'Анонс акции', when: 'вт, 09:00', done: true },
  { id: 'seed-2', networkIndex: 1, label: 'Утренний дайджест', when: 'вт, 09:05', done: true },
  { id: 'seed-3', networkIndex: 4, label: 'Лонгрид про тренды', when: 'ср, 12:00', done: false },
  { id: 'seed-4', networkIndex: 2, label: 'Опрос для подписчиков', when: 'чт, 19:00', done: false },
  { id: 'seed-5', networkIndex: 6, label: 'Шортс: бэкстейдж', when: 'пт, 18:00', done: false },
]

// Заготовки подписей и времён: новые посты берутся из них по кругу (как LABELS/WHENS в макете).
const LABELS = [
  'Анонс акции',
  'Подборка советов',
  'Опрос для подписчиков',
  'Дайджест недели',
  'Бэкстейдж',
]
const WHENS = ['сб, 12:00', 'сб, 15:00', 'вс, 10:00', 'вс, 19:00', 'пн, 09:00']

/**
 * Интерактивное демо «Очередь публикаций» в hero страницы «Автопостинг».
 * Чистый клиент на локальном состоянии: клик по посту убирает его, «+ Добавить» дописывает
 * новый пост по кругу из заготовок. Позже очередь может грузиться из API автопостинга
 * (см. backend-задачи и #147) — реальные запросы вне scope этого демо.
 */
export function QueueDemo() {
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE)
  // Указатель по кругу для новых постов (qNext в макете): стартует с 3 — после стартовых заготовок.
  const [nextIndex, setNextIndex] = useState(3)

  // Счётчик учитывает только посты «в очереди», без уже опубликованных.
  const pending = queue.filter((item) => !item.done).length

  const removeItem = (id: string) => {
    setQueue((items) => items.filter((item) => item.id !== id))
  }

  const addItem = () => {
    setQueue((items) => [
      ...items,
      {
        id: `added-${nextIndex}`,
        networkIndex: nextIndex % NETWORKS.length,
        label: LABELS[nextIndex % LABELS.length],
        when: WHENS[nextIndex % WHENS.length],
        done: false,
      },
    ])
    setNextIndex((value) => value + 1)
  }

  return (
    <Card
      withBorder
      radius="lg"
      p={0}
      style={{
        borderColor: BORDER,
        background: '#fff',
        boxShadow: '0 12px 32px rgba(23,21,15,.08)',
        overflow: 'hidden',
      }}
    >
      <Group
        gap={12}
        align="center"
        px={18}
        py={14}
        wrap="wrap"
        style={{ borderBottom: `1px solid ${SOFT_BORDER}` }}
      >
        <Text fz={15} fw={700}>
          Очередь публикаций
        </Text>
        <Badge
          radius="xl"
          variant="light"
          color="brand"
          styles={{ root: { textTransform: 'none', fontWeight: 600 } }}
        >
          {pending} {plural(pending, ['пост в очереди', 'поста в очереди', 'постов в очереди'])}
        </Badge>
        <Text ml="auto" fz={12} c="rgba(23,21,15,.48)">
          живое демо
        </Text>
      </Group>

      <Stack gap={8} px={18} py={14}>
        {queue.map((item) => {
          // Код и цвет сети — из общего справочника, статус выводится из флага done.
          const network = NETWORKS[item.networkIndex]
          const status = item.done
            ? { label: 'опубликован', color: '#1E7F4F', bg: 'rgba(34,160,107,.12)' }
            : { label: 'в очереди', color: 'rgba(23,21,15,.55)', bg: 'rgba(23,21,15,.07)' }

          return (
            <UnstyledButton
              key={item.id}
              title="Нажмите, чтобы убрать из очереди"
              onClick={() => removeItem(item.id)}
              px={14}
              py={10}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                width: '100%',
                background: '#F6F4EF',
                border: '1px solid rgba(23,21,15,.07)',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              <Text
                fz={9.5}
                fw={700}
                c="#fff"
                ta="center"
                style={{
                  background: network.color,
                  borderRadius: 5,
                  padding: '3px 6px',
                  minWidth: 22,
                  flex: 'none',
                }}
              >
                {network.code}
              </Text>
              <Text fz={14} fw={600}>
                {item.label}
              </Text>
              <Text ml="auto" fz={12.5} c="rgba(23,21,15,.55)" style={{ flex: 'none' }}>
                {item.when}
              </Text>
              <Text
                fz={11}
                fw={700}
                style={{
                  color: status.color,
                  background: status.bg,
                  borderRadius: 'var(--mantine-radius-pill)',
                  padding: '4px 10px',
                  flex: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {status.label}
              </Text>
            </UnstyledButton>
          )
        })}

        <UnstyledButton
          onClick={addItem}
          px={11}
          py={11}
          ta="center"
          style={{
            border: '1.5px dashed rgba(23,21,15,.2)',
            borderRadius: 10,
          }}
        >
          <Text fz={13.5} fw={600} c="rgba(23,21,15,.5)">
            + Добавить в очередь
          </Text>
        </UnstyledButton>
      </Stack>
    </Card>
  )
}
