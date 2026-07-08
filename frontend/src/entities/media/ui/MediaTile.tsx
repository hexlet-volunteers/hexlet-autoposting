import { Box, Card, Text } from '@mantine/core'
import type { Media } from '../model/types'
import { formatDateShort } from '../lib/date'
import { MediaThumb } from './MediaThumb'

// Фон превью-заглушки — кремовый из макета (docs/design/mockups/app-dashboard.html).
const PLACEHOLDER_BG = '#F6F4EF'

/** Круглая иконка play поверх превью видео: круг 28px, тёмный фон, белый символ (по макету). */
function PlayOverlay() {
  return (
    <Box
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        component="span"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(23,21,15,.72)',
          color: '#fff',
          fontSize: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ▶
      </Box>
    </Box>
  )
}

interface MediaTileProps {
  media: Media
  /** Клик по плитке — открыть предпросмотр. */
  onClick: () => void
}

/** Плитка медиатеки: превью-заглушка, имя, размер и дата, play-оверлей для видео. */
export function MediaTile({ media, onClick }: MediaTileProps) {
  return (
    <Card
      withBorder
      radius="lg"
      p="sm"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      style={{ borderColor: 'rgba(23,21,15,.1)', cursor: 'pointer' }}
    >
      <Box
        mb="sm"
        style={{
          position: 'relative',
          aspectRatio: '4 / 3',
          borderRadius: 12,
          background: PLACEHOLDER_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Для видео вместо иконки-миниатюры — play-оверлей по центру, как в макете */}
        {media.kind === 'video' ? <PlayOverlay /> : <MediaThumb kind={media.kind} />}
      </Box>
      <Text fz={13.5} fw={600} lineClamp={1} title={media.name}>
        {media.name}
      </Text>
      <Text fz={12} c="dimmed" mt={4} lineClamp={1}>
        {media.sizeLabel} · {formatDateShort(media.uploadedAt)}
      </Text>
    </Card>
  )
}
