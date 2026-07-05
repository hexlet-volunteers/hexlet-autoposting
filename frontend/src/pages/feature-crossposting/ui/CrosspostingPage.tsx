import { Link } from 'react-router-dom'
import {
  Anchor,
  Box,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core'
import {
  IconLayoutGrid,
  IconLink,
  IconChecks,
} from '@tabler/icons-react'
import { MarketingHeader } from '@/widgets/marketing-header'
import { MarketingFooter } from '@/widgets/marketing-footer'
import { useAuthModal } from '@/features/auth'
import type { Icon } from '@tabler/icons-react'

interface Capability {
  icon: Icon
  title: string
  description: string
}

/** Возможности блока «Что внутри» — тексты дословно из макета feature-crossposting. */
const CAPABILITIES: Capability[] = [
  {
    icon: IconLayoutGrid,
    title: 'Форматы — сами',
    description:
      'ВК получит пост с фото, Дзен — заголовок, Telegram — кнопку-ссылку. Ничего не настраивать.',
  },
  {
    icon: IconLink,
    title: 'UTM-метки под каждую сеть',
    description:
      'Ссылки помечаются автоматически — увидите, какая площадка приводит клиентов.',
  },
  {
    icon: IconChecks,
    title: 'Правки — везде сразу',
    description:
      'Изменили текст или время до публикации — обновится на всех площадках одним действием.',
  },
]

/** Публичная маркетинговая страница фичи «Кросспостинг» (/features/crossposting). */
export function CrosspostingPage() {
  const { open } = useAuthModal()

  return (
    <>
      <MarketingHeader />

      <Box component="main">
        {/* Хлебные крошки */}
        <Container size="lg" pt={{ base: 20, sm: 24 }}>
          <Text fz={13} c="dimmed">
            <Anchor
              component={Link}
              to="/#features"
              c="dimmed"
              underline="never"
              inherit
            >
              Возможности
            </Anchor>{' '}
            /{' '}
            <Text component="span" fw={600} c="dark">
              Кросспостинг
            </Text>
          </Text>
        </Container>

        {/* Hero */}
        <Box component="section" py={{ base: 40, sm: 56 }}>
          <Container size="lg">
            <Stack gap={0} maw={640}>
              <Box
                style={{
                  display: 'inline-block',
                  alignSelf: 'flex-start',
                  background: 'rgba(43,80,236,.08)',
                  color: '#2B50EC',
                  borderRadius: 999,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Кросспостинг
              </Box>

              <Text
                component="h1"
                mt={16}
                fz={{ base: 32, sm: 42 }}
                fw={800}
                lh={1.1}
                style={{ letterSpacing: '-.7px' }}
              >
                Один пост —{' '}
                <Text
                  component="span"
                  inherit
                  style={{
                    background: '#FFD84D',
                    padding: '0 8px',
                    borderRadius: 8,
                  }}
                >
                  все площадки
                </Text>{' '}
                сразу
              </Text>

              <Text mt={16} fz={16} lh={1.55} c="rgba(23,21,15,.7)">
                Напишите текст один раз. Отложка сама адаптирует его под каждую
                сеть: лимиты символов, форматы, заголовки, кнопки и UTM-метки.
              </Text>

              <Group mt={24} gap={12}>
                <Button
                  size="md"
                  radius="md"
                  color="brand"
                  onClick={() => open('register')}
                >
                  Попробовать бесплатно
                </Button>
                <Button
                  component={Link}
                  to="/#features"
                  size="md"
                  radius="md"
                  variant="default"
                >
                  Все возможности
                </Button>
              </Group>
            </Stack>
          </Container>
        </Box>

        {/* Что внутри */}
        <Box
          component="section"
          py={{ base: 48, sm: 64 }}
          style={{
            background: '#fff',
            borderTop: '1px solid rgba(23,21,15,.08)',
          }}
        >
          <Container size="lg">
            <Text
              component="h2"
              fz={{ base: 26, sm: 30 }}
              fw={800}
              style={{ letterSpacing: '-.5px' }}
            >
              Что внутри
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mt={28}>
              {CAPABILITIES.map((cap) => (
                <Card key={cap.title} withBorder radius="lg" p="lg">
                  <Stack gap={10}>
                    <ThemeIcon variant="light" color="brand" size={44} radius="md">
                      <cap.icon size={24} stroke={1.8} />
                    </ThemeIcon>
                    <Text fz={17} fw={700}>
                      {cap.title}
                    </Text>
                    <Text fz={14} lh={1.55} c="rgba(23,21,15,.65)">
                      {cap.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        {/* Финальный CTA-баннер */}
        <Box component="section" py={{ base: 40, sm: 56 }}>
          <Container size="lg">
            <Box
              p={{ base: 28, sm: 40 }}
              style={{ background: '#17150F', borderRadius: 20, color: '#F6F4EF' }}
            >
              <Group justify="space-between" align="center" gap={24} wrap="wrap">
                <Stack gap={8} maw={620}>
                  <Text
                    component="h2"
                    fz={{ base: 24, sm: 26 }}
                    fw={800}
                    lh={1.15}
                    style={{ letterSpacing: '-.4px' }}
                  >
                    Хватит копировать посты руками
                  </Text>
                  <Text fz={{ base: 14, sm: 14.5 }} c="rgba(246,244,239,.65)">
                    Один черновик — семь публикаций. Бесплатный тариф без карты.
                  </Text>
                </Stack>

                <Button
                  size="md"
                  radius="md"
                  onClick={() => open('register')}
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
      </Box>

      <MarketingFooter />
    </>
  )
}
