import { Box, Button, Container, Group, Stack, Text } from '@mantine/core'
import { useAuthModal } from '@/features/auth'

/** Финальный CTA-баннер лендинга: брендовая плашка во всю ширину экрана с заголовком и кнопкой. */
export function CtaSection() {
  const { open } = useAuthModal()

  return (
    <Box component="section" style={{ background: '#2B50EC', color: '#fff' }}>
      <Container size="lg" py={{ base: 40, sm: 52 }}>
        <Group justify="space-between" align="center" gap={24} wrap="wrap">
          <Stack gap={8} maw={620}>
            <Text
              component="h2"
              fz={{ base: 24, sm: 28 }}
              fw={800}
              lh={1.15}
              style={{ letterSpacing: '-.4px' }}
            >
              Первая неделя контента соберётся за вечер
            </Text>
            <Text fz={{ base: 14, sm: 14.5 }} c="rgba(255,255,255,.78)">
              Бесплатный тариф — без срока действия и без карты.
            </Text>
          </Stack>

          <Button
            size="md"
            radius="md"
            onClick={() => open('register')}
            styles={{
              root: {
                background: 'var(--mantine-color-accent-5)',
                color: '#17150F',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              },
            }}
          >
            Попробовать бесплатно
          </Button>
        </Group>
      </Container>
    </Box>
  )
}
