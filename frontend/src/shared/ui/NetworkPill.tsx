import { Box, Group, Text } from '@mantine/core'
import type { Network } from '@/shared/config/networks'

interface NetworkPillProps {
  network: Network
  variant?: 'pill' | 'badge'
}

/** Бейдж соцсети: цветной короткий код (+ название в варианте pill). */
export function NetworkPill({ network, variant = 'pill' }: NetworkPillProps) {
  const badge = (
    <Box
      style={{
        width: 24,
        height: 24,
        borderRadius: 7,
        background: network.color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 11,
        flexShrink: 0,
      }}
    >
      {network.code}
    </Box>
  )

  if (variant === 'badge') return badge

  return (
    <Group
      gap={8}
      wrap="nowrap"
      style={{
        padding: '6px 12px 6px 6px',
        borderRadius: 'var(--mantine-radius-pill)',
        border: `1px solid ${network.color}59`,
        background: `${network.color}14`,
      }}
    >
      {badge}
      <Text size="sm" fw={600}>
        {network.name}
      </Text>
    </Group>
  )
}
