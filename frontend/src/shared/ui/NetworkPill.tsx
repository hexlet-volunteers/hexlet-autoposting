import { Box, Group, Text } from '@mantine/core'
import type { Network } from '@/shared/config/networks'
import { NETWORK_GLYPHS } from './networkGlyphs'

type BadgeSize = 'md' | 'chipSm' | 'cardSm'

interface NetworkPillProps {
  network: Network
  variant?: 'pill' | 'badge'
  /**
   * Размер значка-логотипа в варианте `badge`:
   * - `md` (по умолчанию) — квадрат 24×24 (шапки, очередь, лендинг);
   * - `chipSm` — компактный 18×18 для чипсов площадок над календарём;
   * - `cardSm` — компактный 16×16 для карточек постов в недельной сетке.
   * В варианте `pill` не влияет — внутри всегда `md`.
   */
  size?: BadgeSize
}

/** Бейдж соцсети: брендовый значок с реальным логотипом (+ название в варианте pill). */
export function NetworkPill({ network, variant = 'pill', size = 'md' }: NetworkPillProps) {
  if (variant === 'badge') return <NetworkBadge network={network} size={size} />

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
      <NetworkBadge network={network} size="md" />
      <Text size="sm" fw={600}>
        {network.name}
      </Text>
    </Group>
  )
}

// Геометрия бейджа по контексту: размер квадрата, скругление и размер глифа внутри.
const BADGE_GEOMETRY: Record<BadgeSize, { box: number; radius: number; glyph: number }> = {
  md: { box: 24, radius: 7, glyph: 15 },
  chipSm: { box: 18, radius: 5, glyph: 12 },
  cardSm: { box: 16, radius: 4, glyph: 11 },
}

/** Логотип площадки — белый моно-глиф на брендовом скруглённом квадрате. */
function NetworkBadge({ network, size }: { network: Network; size: BadgeSize }) {
  const { box, radius, glyph } = BADGE_GEOMETRY[size]
  const data = NETWORK_GLYPHS[network.id]

  return (
    <Box
      style={{
        width: box,
        height: box,
        borderRadius: radius,
        background: network.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-label={network.name}
    >
      {data ? (
        <svg viewBox={data.viewBox} width={glyph} height={glyph} fill="#fff" role="img" aria-hidden>
          {data.paths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>
      ) : (
        // Фолбэк на короткий код, если глифа для площадки нет.
        <Text component="span" fw={800} fz={box >= 24 ? 11 : 9} c="#fff" style={{ lineHeight: 1 }}>
          {network.code}
        </Text>
      )}
    </Box>
  )
}
