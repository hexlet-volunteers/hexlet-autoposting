import { Box } from '@mantine/core'

/**
 * Круглая иконка play (▶) по центру области превью видео:
 * круг 28px, фон rgba(23,21,15,.72), белый значок — точно по макету
 * docs/design/mockups/app-dashboard.html. Родитель должен быть position: relative.
 */
export function PlayOverlay() {
  return (
    <Box
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
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
