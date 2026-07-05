import { Badge, Card, Group, Stack, Text } from '@mantine/core'
import { IconPlugConnected } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { formatDateTime } from '@/shared/lib'
import type { Platform } from '../model/types'

interface PlatformCardProps {
  platform: Platform
  actions?: ReactNode
}

export function PlatformCard({ platform, actions }: PlatformCardProps) {
  return (
    <Card withBorder radius="md" padding="md">
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Group gap={8}>
            <IconPlugConnected size={18} />
            <Text fw={600}>{platform.name || `Платформа #${platform.id}`}</Text>
          </Group>
          <Badge color={platform.isActive ? 'green' : 'gray'} variant="light">
            {platform.isActive ? 'Активна' : 'Отключена'}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed">
          Создана: {formatDateTime(platform.createdAt)}
        </Text>
        {actions ? (
          <Group justify="flex-end" gap="xs" mt={4}>
            {actions}
          </Group>
        ) : null}
      </Stack>
    </Card>
  )
}
