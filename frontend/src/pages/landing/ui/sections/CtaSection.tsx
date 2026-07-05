import { Link } from 'react-router-dom'
import { Box, Button, Container, Group, Stack, Text } from '@mantine/core'

/** Финальный CTA-баннер лендинга: яркая брендовая плашка с заголовком и кнопкой. */
export function CtaSection() {
  return (
    <Box component="section" py={{ base: 40, sm: 56 }}>
      <Container size="lg">
        <Box
          p={{ base: 28, sm: 40 }}
          style={{ background: '#2B50EC', borderRadius: 20, color: '#fff' }}
        >
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
              component={Link}
              to="/login"
              size="md"
              radius="md"
              styles={{
                root: {
                  background: '#FFD84D',
                  color: '#17150F',
                  fontWeight: 700,
                },
              }}
            >
              Попробовать бесплатно
            </Button>
          </Group>
        </Box>
      </Container>
    </Box>
  )
}
