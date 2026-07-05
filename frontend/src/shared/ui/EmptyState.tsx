import { Stack, Text, ThemeIcon } from '@mantine/core'
import { IconInbox } from '@tabler/icons-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

/** Neutral placeholder for empty collections. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Stack align="center" gap="xs" py="xl">
      <ThemeIcon variant="light" size={48} radius="xl" color="gray">
        <IconInbox size={28} />
      </ThemeIcon>
      <Text fw={600}>{title}</Text>
      {description ? (
        <Text c="dimmed" size="sm" ta="center">
          {description}
        </Text>
      ) : null}
      {action}
    </Stack>
  )
}
