import { Box, Group, Text } from '@mantine/core'

/** Логотип «Отложка»: синий квадрат с «О» + жирный вордмарк. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <Group gap={10} wrap="nowrap">
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          background: '#2B50EC',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: size * 0.54,
        }}
      >
        О
      </Box>
      <Text fw={800} fz={18} style={{ letterSpacing: '-0.2px' }}>
        Отложка
      </Text>
    </Group>
  )
}
