import { Box, Group, Text } from '@mantine/core'
import type { Network } from '@/shared/config/networks'

type BadgeSize = 'md' | 'chipSm' | 'cardSm'

interface NetworkPillProps {
  network: Network
  variant?: 'pill' | 'badge'
  /**
   * Размер цветного кода-значка в варианте `badge`:
   * - `md` (по умолчанию) — квадрат 24×24 (шапки, очередь, лендинг);
   * - `chipSm` — компактная пилюля 9px для чипсов площадок (макет netChips);
   * - `cardSm` — компактный прямоугольник 9px для карточек постов (макет day.posts).
   * В варианте `pill` не влияет — внутри всегда `md`.
   */
  size?: BadgeSize
}

/** Бейдж соцсети: цветной короткий код (+ название в варианте pill). */
export function NetworkPill({ network, variant = 'pill', size = 'md' }: NetworkPillProps) {
  if (variant === 'badge') return <CodeBadge network={network} size={size} />

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
      <CodeBadge network={network} size="md" />
      <Text size="sm" fw={600}>
        {network.name}
      </Text>
    </Group>
  )
}

/** Цветной значок с коротким кодом сети. Форма/размер зависят от контекста (`size`). */
function CodeBadge({ network, size }: { network: Network; size: BadgeSize }) {
  if (size === 'chipSm') {
    // Пилюля для чипсов площадок над календарём (макет netChips).
    return (
      <Box
        component="span"
        style={{
          flexShrink: 0,
          lineHeight: 1,
          fontSize: 9,
          fontWeight: 700,
          color: '#fff',
          background: network.color,
          borderRadius: 'var(--mantine-radius-pill)',
          padding: '3px 6px',
        }}
      >
        {network.code}
      </Box>
    )
  }

  if (size === 'cardSm') {
    // Прямоугольник для карточек постов в недельной сетке (макет day.posts).
    return (
      <Box
        component="span"
        style={{
          flexShrink: 0,
          lineHeight: 1,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.3px',
          color: '#fff',
          background: network.color,
          borderRadius: 4,
          padding: '2px 5px',
        }}
      >
        {network.code}
      </Box>
    )
  }

  // md (по умолчанию) — квадрат 24×24, как раньше.
  return (
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
}
