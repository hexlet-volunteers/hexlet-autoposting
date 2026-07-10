import { usePageMeta } from '@/shared/lib'
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
  Title,
} from '@mantine/core'
import { IconCalendarStats, IconPencil, IconSparkles } from '@tabler/icons-react'
import type { Icon } from '@tabler/icons-react'
import { MarketingHeader } from '@/widgets/marketing-header'
import { MarketingFooter } from '@/widgets/marketing-footer'
import { useAuthModal } from '@/features/auth'
import { PostGeneratorDemo } from './PostGeneratorDemo'
import styles from './AiFeaturePage.module.css'

interface FeatureItem {
  icon: Icon
  title: string
  description: string
}

/** Возможности ИИ-помощника — тексты взяты дословно из макета feature-ai. */
const FEATURES: FeatureItem[] = [
  {
    icon: IconSparkles,
    title: 'Пост по теме или фото',
    description:
      'Напишите тему в двух словах или загрузите фото — получите готовый текст в вашем стиле.',
  },
  {
    icon: IconPencil,
    title: 'Рерайт под площадку',
    description:
      'Сожмёт лонгрид до поста в MAX, развернёт заметку в статью для Дзена — смысл сохранит.',
  },
  {
    icon: IconCalendarStats,
    title: 'Идеи и план на месяц',
    description: 'Предложит рубрики и календарь публикаций по вашей нише — останется заполнить.',
  },
]

const DARK = '#17150F'
const BORDER = 'rgba(23,21,15,.1)'

export function AiFeaturePage() {
  usePageMeta({
    title: 'ИИ-помощник — Отложка',
    description: 'ИИ-помощник Отложки подберёт текст поста под площадку и тон за секунды.',
  })
  const { open } = useAuthModal()

  return (
    <Box>
      <MarketingHeader active="features" />

      {/* Хлебные крошки */}
      <Container size="lg" pt={24} pb={0}>
        <Text fz={13} c="rgba(23,21,15,.5)">
          <Anchor component={Link} to="/" fz={13} c="rgba(23,21,15,.5)" underline="never">
            Главная
          </Anchor>{' '}
          /{' '}
          <Anchor component={Link} to="/#features" fz={13} c="rgba(23,21,15,.5)" underline="never">
            Возможности
          </Anchor>{' '}
          /{' '}
          <Text component="span" c="rgba(23,21,15,.85)" fw={600}>
            ИИ-помощник
          </Text>
        </Text>
      </Container>

      {/* Hero: слева тексты и кнопки, справа демо-генератор постов */}
      <Box component="section">
        <Container size="lg" py={{ base: 48, sm: 64 }}>
          <Box className={styles.hero}>
            <Stack gap={0} maw={620} pt={{ base: 0, md: 20 }}>
              <Box
                style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(43,80,236,.08)',
                  borderRadius: 'var(--mantine-radius-pill)',
                  padding: '6px 12px',
                }}
              >
                <Text fz={12} fw={700} c="brand.6">
                  ИИ-помощник
                </Text>
              </Box>

              <Title
                order={1}
                mt={16}
                fz={{ base: 32, sm: 42 }}
                fw={800}
                lh={1.1}
                style={{ letterSpacing: '-0.5px', textWrap: 'balance' }}
              >
                ИИ{' '}
                <Box
                  component="span"
                  px={8}
                  style={{ background: 'var(--mantine-color-accent-5)', borderRadius: 8 }}
                >
                  пишет
                </Box>{' '}
                — вы публикуете
              </Title>

              <Text mt={16} fz={{ base: 15.5, sm: 16 }} lh={1.55} c="rgba(23,21,15,.7)">
                Пост по теме, по фото или по прошлым публикациям — в вашем тоне. Отредактируйте пару
                слов и отправьте в отложку. Идеи больше не заканчиваются.
              </Text>

              <Group gap={12} mt={26} wrap="wrap">
                <Button size="md" radius="md" color="brand" onClick={() => open('register')}>
                  Попробовать бесплатно
                </Button>
                <Button
                  component={Link}
                  to="/features/crossposting"
                  size="md"
                  radius="md"
                  variant="outline"
                  color="dark"
                >
                  А кросспостинг?
                </Button>
              </Group>
            </Stack>

            <PostGeneratorDemo />
          </Box>
        </Container>
      </Box>

      {/* Что внутри */}
      <Box component="section" bg="#fff" style={{ borderTop: `1px solid ${BORDER}` }}>
        <Container size="lg" py={{ base: 48, sm: 64 }}>
          <Title order={2} fz={{ base: 26, sm: 30 }} fw={800} style={{ letterSpacing: '-0.5px' }}>
            Что внутри
          </Title>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mt={28}>
            {FEATURES.map((feature) => (
              <Card key={feature.title} radius="lg" p={26} style={{ background: '#F6F4EF' }}>
                <Stack gap={10}>
                  <feature.icon size={26} stroke={1.8} color="var(--mantine-color-brand-6)" />
                  <Text fz={17} fw={700}>
                    {feature.title}
                  </Text>
                  <Text fz={14} lh={1.55} c="rgba(23,21,15,.65)">
                    {feature.description}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Финальный CTA-баннер: тёмная полоса #17150F во всю ширину (макет feature-ai) */}
      <Box component="section" style={{ background: DARK, color: '#F6F4EF' }}>
        <Container size="lg" py={{ base: 40, sm: 56 }}>
          <Group justify="space-between" align="center" gap={24} wrap="wrap">
            <Stack gap={8} maw={620}>
              <Text
                component="h2"
                fz={{ base: 22, sm: 26 }}
                fw={800}
                lh={1.15}
                style={{ letterSpacing: '-0.4px' }}
              >
                5 ИИ-текстов в месяц — бесплатно
              </Text>
              <Text fz={{ base: 14, sm: 14.5 }} c="rgba(246,244,239,.65)">
                Попробуйте на своём проекте, карта не нужна.
              </Text>
            </Stack>

            <Button
              size="md"
              radius="md"
              onClick={() => open('register')}
              styles={{
                root: {
                  background: 'var(--mantine-color-accent-5)',
                  color: DARK,
                  fontWeight: 700,
                },
              }}
            >
              Попробовать бесплатно
            </Button>
          </Group>
        </Container>
      </Box>

      <MarketingFooter />
    </Box>
  )
}
