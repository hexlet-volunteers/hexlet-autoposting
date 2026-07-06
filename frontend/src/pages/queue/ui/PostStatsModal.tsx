import { Anchor, Group, Modal, Paper, SimpleGrid, Stack, Text } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons-react'
import { NETWORKS } from '@/shared/config/networks'
import { NetworkPill } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'
import type { Post } from '@/entities/scheduled-post'

const NETWORK_BY_ID = new Map(NETWORKS.map((n) => [n.id, n]))

interface PostStatsModalProps {
  post: Post | null
  opened: boolean
  onClose: () => void
}

interface MetricCellProps {
  value: number
  label: string
}

function MetricCell({ value, label }: MetricCellProps) {
  return (
    <Paper bg="gray.0" radius="md" p="sm">
      <Text fz={19} fw={800}>
        {value.toLocaleString('ru-RU')}
      </Text>
      <Text size="xs" c="dimmed" mt={2}>
        {label}
      </Text>
    </Paper>
  )
}

/** Локальная модалка «Статистика поста»: метрики отправленной публикации. */
export function PostStatsModal({ post, opened, onClose }: PostStatsModalProps) {
  const network = post ? NETWORK_BY_ID.get(post.networkIds[0]) : undefined
  const metrics = post?.metrics

  return (
    <Modal
      opened={opened}
      onClose={onClose}
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

          <Paper bg="gray.0" radius="md" p="md">
            <Text size="sm" style={{ lineHeight: 1.55 }}>
              {post.text}
            </Text>
          </Paper>

          {metrics ? (
            <SimpleGrid cols={{ base: 2, xs: 4 }} spacing="sm">
              <MetricCell value={metrics.views} label="просмотры" />
              <MetricCell value={metrics.likes} label="лайки" />
              <MetricCell value={metrics.reposts} label="репосты" />
              <MetricCell value={metrics.comments} label="комментарии" />
            </SimpleGrid>
          ) : null}

          <Group justify="flex-end">
            {/* TODO (Design First): реальная ссылка из GET /posts/{id} (поле publishedUrl). */}
            <Anchor href="#" fw={700} c="brand" onClick={(e) => e.preventDefault()}>
              <Group gap={4} wrap="nowrap">
                Открыть на площадке
                <IconExternalLink size={16} />
              </Group>
            </Anchor>
          </Group>
        </Stack>
      ) : null}
    </Modal>
  )
}
