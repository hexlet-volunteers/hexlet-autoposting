import { useEffect, useState } from 'react'
import { Anchor, Group, Modal, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core'
import { NETWORKS } from '@/shared/config'
import { NetworkPill } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'
import type { Post, PostMetrics } from '@/entities/scheduled-post'

const NETWORK_BY_ID = new Map(NETWORKS.map((n) => [n.id, n]))

/** Кремовая подложка плиток и текста поста (макет app-dashboard, «Статистика поста»). */
const PANEL_BG = '#F6F4EF'
/** Акцент плитки ER: зелёная подложка и тёмно-зелёное число. */
const ER_BG = 'rgba(34, 160, 107, 0.1)'
const ER_COLOR = '#1E7F4F'

/**
 * Переходы и ER отправленных постов (#196). Поля clicks/er должны жить
 * в PostMetrics — сущность entities/scheduled-post дорабатывается отдельно,
 * поэтому до её обновления значения замоканы локально; одноимённые поля
 * из сущности имеют приоритет, как только появятся (см. getExtendedMetrics).
 */
const EXTRA_METRICS: Record<string, { clicks: number; er: string }> = {
  'sp-sent-1': { clicks: 342, er: '3.5%' },
  'sp-sent-2': { clicks: 261, er: '5.8%' },
  'sp-sent-3': { clicks: 148, er: '3.6%' },
  'sp-sent-4': { clicks: 517, er: '5.6%' },
}

/** clicks/er: из сущности, если поля уже добавлены в PostMetrics; иначе — локальный мок. */
function getExtendedMetrics(post: Post): { clicks?: number; er?: string } {
  const entity = post.metrics as (PostMetrics & { clicks?: number; er?: string }) | undefined
  const fallback = EXTRA_METRICS[post.id]
  return { clicks: entity?.clicks ?? fallback?.clicks, er: entity?.er ?? fallback?.er }
}

interface PostStatsModalProps {
  post: Post | null
  opened: boolean
  onClose: () => void
}

interface MetricCellProps {
  value: string
  label: string
  /** Акцентная плитка (ER): зелёный фон и зелёное число. */
  accent?: boolean
}

function MetricCell({ value, label, accent = false }: MetricCellProps) {
  return (
    <Paper radius={11} p={12} style={{ background: accent ? ER_BG : PANEL_BG }}>
      <Text fz={19} fw={800} style={accent ? { color: ER_COLOR } : undefined}>
        {value}
      </Text>
      <Text fz={11} mt={2} style={{ color: 'rgba(23, 21, 15, 0.5)' }}>
        {label}
      </Text>
    </Paper>
  )
}

/** Локальная модалка «Статистика поста»: метрики отправленной публикации. */
export function PostStatsModal({ post, opened, onClose }: PostStatsModalProps) {
  const network = post ? NETWORK_BY_ID.get(post.networkIds[0]) : undefined
  const metrics = post?.metrics
  const extended = post ? getExtendedMetrics(post) : undefined

  // Имитация загрузки статистики (~600 мс, как в остальных моках): реальный
  // GET /posts/{id}/stats подключается отдельной backend-задачей (#147).
  // Храним id поста, для которого «загрузка» завершилась; при закрытии сбрасываем,
  // чтобы каждое открытие модалки снова показывало скелетоны.
  const [loadedId, setLoadedId] = useState<string | null>(null)
  const postId = post?.id
  const isLoading = postId != null && loadedId !== postId

  useEffect(() => {
    if (!opened || postId == null) return undefined
    const timer = window.setTimeout(() => setLoadedId(postId), 600)
    return () => window.clearTimeout(timer)
  }, [opened, postId])

  const handleClose = () => {
    setLoadedId(null)
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="lg"
      radius="lg"
      title={
        <Group gap="sm" wrap="nowrap">
          {network ? <NetworkPill network={network} variant="badge" /> : null}
          <Text fz={16} fw={800} lineClamp={1}>
            {post?.title}
          </Text>
        </Group>
      }
    >
      {post ? (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {network?.name} · опубликован {formatDateTime(post.scheduledAt)}
          </Text>

          <Paper radius={12} p={14} style={{ background: PANEL_BG }}>
            <Text fz={13.5} style={{ lineHeight: 1.55, color: 'rgba(23, 21, 15, 0.8)' }}>
              {post.text}
            </Text>
          </Paper>

          {isLoading ? (
            <SimpleGrid cols={3} spacing={10}>
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} height={64} radius={11} />
              ))}
            </SimpleGrid>
          ) : metrics ? (
            <SimpleGrid cols={3} spacing={10}>
              <MetricCell value={metrics.views.toLocaleString('ru-RU')} label="просмотры" />
              <MetricCell value={metrics.likes.toLocaleString('ru-RU')} label="лайки" />
              <MetricCell value={metrics.reposts.toLocaleString('ru-RU')} label="репосты" />
              <MetricCell value={metrics.comments.toLocaleString('ru-RU')} label="комментарии" />
              <MetricCell
                value={extended?.clicks != null ? extended.clicks.toLocaleString('ru-RU') : '—'}
                label="переходы"
              />
              {/* ER выводим строкой как есть — на фронте не пересчитываем. */}
              <MetricCell value={extended?.er ?? '—'} label="ER" accent />
            </SimpleGrid>
          ) : (
            <Text size="sm" c="dimmed" ta="center" py="md">
              Не удалось загрузить статистику
            </Text>
          )}

          <Group justify="space-between" gap="sm">
            <Text fz={12} style={{ color: 'rgba(23, 21, 15, 0.45)' }}>
              UTM-метка: utm_source={post.networkIds[0]}
            </Text>
            {/* TODO (Design First): реальная ссылка из GET /posts/{id} (поле publishedUrl). */}
            <Anchor href="#" fz={13} fw={700} c="brand" onClick={(event) => event.preventDefault()}>
              Открыть на площадке →
            </Anchor>
          </Group>
        </Stack>
      ) : null}
    </Modal>
  )
}
