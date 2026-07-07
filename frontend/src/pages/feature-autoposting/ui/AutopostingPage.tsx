import { Link } from 'react-router-dom'
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { IconCalendarEvent, IconClockHour4, IconRefresh } from '@tabler/icons-react'
import type { Icon } from '@tabler/icons-react'
import { MarketingHeader } from '@/widgets/marketing-header'
import { MarketingFooter } from '@/widgets/marketing-footer'
import { useAuthModal } from '@/features/auth'

const BORDER = 'rgba(23,21,15,.1)'
const SOFT_BORDER = 'rgba(23,21,15,.09)'

interface FeatureCard {
  icon: Icon
  title: string
  description: string
}

const FEATURES: FeatureCard[] = [
  {
    icon: IconCalendarEvent,
    title: 'Календарь наперёд',
    description: 'Неделя, месяц или год — расставьте посты заранее и меняйте план перетаскиванием.',
  },
  {
    icon: IconRefresh,
    title: 'Автоповторы',
    description: 'Вечнозелёные посты выходят снова сами — раз в неделю или месяц, как настроите.',
  },
  {
    icon: IconClockHour4,
    title: 'Лучшее время',
    description: 'Подскажем, когда ваша аудитория онлайн, — по статистике прошлых публикаций.',
  },
]

interface QueueItem {
  short: string
  color: string
  label: string
  when: string
  status: string
  statusColor: string
  statusBg: string
}

const QUEUE: QueueItem[] = [
  {
    short: 'ВК',
    color: '#0077FF',
    label: 'Анонс акции',
    when: 'вт, 09:00',
    status: 'опубликован',
    statusColor: '#1E7F4F',
    statusBg: 'rgba(34,160,107,.12)',
  },
  {
    short: 'TG',
    color: '#27A6E5',
    label: 'Утренний дайджест',
    when: 'вт, 09:05',
    status: 'опубликован',
    statusColor: '#1E7F4F',
    statusBg: 'rgba(34,160,107,.12)',
  },
  {
    short: 'Дз',
    color: '#1E1E20',
    label: 'Лонгрид про тренды',
    when: 'ср, 12:00',
    status: 'в очереди',
    statusColor: 'rgba(23,21,15,.55)',
    statusBg: 'rgba(23,21,15,.07)',
  },
  {
    short: 'ОК',
    color: '#F7931E',
    label: 'Опрос для подписчиков',
    when: 'чт, 19:00',
    status: 'в очереди',
    statusColor: 'rgba(23,21,15,.55)',
    statusBg: 'rgba(23,21,15,.07)',
  },
  {
    short: 'YT',
    color: '#FF0000',
    label: 'Шортс: бэкстейдж',
    when: 'пт, 18:00',
    status: 'в очереди',
    statusColor: 'rgba(23,21,15,.55)',
    statusBg: 'rgba(23,21,15,.07)',
  },
]

export function AutopostingPage() {
  const { open } = useAuthModal()

  return (
    <Box style={{ background: '#F6F4EF', color: '#17150F' }}>
      <MarketingHeader />

      {/* Хлебные крошки */}
      <Container size="lg" pt={{ base: 20, sm: 28 }}>
        <Text fz={13} c="rgba(23,21,15,.5)">
          <Text
            component={Link}
            to="/#features"
            inherit
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            Возможности
          </Text>{' '}
          /{' '}
          <Text component="span" fw={600} c="#17150F">
            Автопостинг
          </Text>
        </Text>
      </Container>

      {/* Hero */}
      <Box component="section">
        <Container size="lg" py={{ base: 48, sm: 64 }}>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={48} verticalSpacing={40}>
            <Stack gap={0} justify="center">
              <Box>
                <Badge
                  radius="xl"
                  variant="light"
                  color="brand"
                  styles={{ root: { textTransform: 'none', fontWeight: 700 } }}
                >
                  Автопостинг
                </Badge>
              </Box>

              <Title
                order={1}
                mt={16}
                fz={{ base: 32, sm: 42 }}
                fw={800}
                lh={1.1}
                style={{ letterSpacing: '-.7px', textWrap: 'balance' }}
              >
                Посты выходят по расписанию —{' '}
                <Box component="span" px={8} style={{ background: '#FFD84D', borderRadius: 8 }}>
                  без вас
                </Box>
              </Title>

              <Text mt={16} fz={{ base: 15.5, sm: 16 }} lh={1.55} c="rgba(23,21,15,.7)">
                Соберите очередь публикаций на неделю или месяц вперёд. Отложка выпустит всё точно в
                срок и пришлёт отчёт в Telegram — а вы займётесь делом.
              </Text>

              <Group gap={12} mt={24}>
                <Button size="md" radius="md" color="brand" onClick={() => open('register')}>
                  Попробовать бесплатно
                </Button>
                <Button
                  component={Link}
                  to="/#features"
                  size="md"
                  radius="md"
                  variant="outline"
                  color="dark"
                >
                  А кросспостинг?
                </Button>
              </Group>
            </Stack>

            {/* Живое демо: очередь публикаций (статичное представление) */}
            <Card
              withBorder
              radius="lg"
              p={0}
              style={{
                borderColor: BORDER,
                background: '#fff',
                boxShadow: '0 12px 32px rgba(23,21,15,.08)',
                overflow: 'hidden',
              }}
            >
              <Group
                gap={12}
                align="center"
                px={18}
                py={14}
                wrap="wrap"
                style={{ borderBottom: `1px solid ${SOFT_BORDER}` }}
              >
                <Text fz={15} fw={700}>
                  Очередь публикаций
                </Text>
                <Badge
                  radius="xl"
                  variant="light"
                  color="brand"
                  styles={{ root: { textTransform: 'none', fontWeight: 600 } }}
                >
                  3 поста в очереди
                </Badge>
                <Text ml="auto" fz={12} c="rgba(23,21,15,.48)">
                  живое демо
                </Text>
              </Group>

              <Stack gap={8} px={18} py={14}>
                {QUEUE.map((item) => (
                  <Group
                    key={`${item.short}-${item.label}`}
                    gap={11}
                    wrap="nowrap"
                    align="center"
                    px={14}
                    py={10}
                    style={{
                      background: '#F6F4EF',
                      border: `1px solid rgba(23,21,15,.07)`,
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      fz={9.5}
                      fw={700}
                      c="#fff"
                      ta="center"
                      style={{
                        background: item.color,
                        borderRadius: 5,
                        padding: '3px 6px',
                        minWidth: 22,
                        flex: 'none',
                      }}
                    >
                      {item.short}
                    </Text>
                    <Text fz={14} fw={600}>
                      {item.label}
                    </Text>
                    <Text ml="auto" fz={12.5} c="rgba(23,21,15,.55)" style={{ flex: 'none' }}>
                      {item.when}
                    </Text>
                    <Text
                      fz={11}
                      fw={700}
                      style={{
                        color: item.statusColor,
                        background: item.statusBg,
                        borderRadius: 999,
                        padding: '4px 10px',
                        flex: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.status}
                    </Text>
                  </Group>
                ))}

                <Box
                  px={11}
                  py={11}
                  ta="center"
                  style={{
                    border: '1.5px dashed rgba(23,21,15,.2)',
                    borderRadius: 10,
                  }}
                >
                  <Text fz={13.5} fw={600} c="rgba(23,21,15,.5)">
                    + Добавить в очередь
                  </Text>
                </Box>
              </Stack>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Что внутри */}
      <Box
        component="section"
        style={{ background: '#fff', borderTop: `1px solid ${SOFT_BORDER}` }}
      >
        <Container size="lg" py={{ base: 48, sm: 64 }}>
          <Title order={2} fz={{ base: 26, sm: 30 }} fw={800} style={{ letterSpacing: '-.5px' }}>
            Что внутри
          </Title>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={20} mt={28}>
            {FEATURES.map((feature) => {
              const FeatureIcon = feature.icon
              return (
                <Card
                  key={feature.title}
                  withBorder
                  radius="lg"
                  p="lg"
                  style={{ borderColor: BORDER, background: '#F6F4EF' }}
                >
                  <Stack gap={10}>
                    <ThemeIcon variant="light" color="brand" size={44} radius="md">
                      <FeatureIcon size={24} stroke={1.8} />
                    </ThemeIcon>
                    <Text fz={17} fw={700}>
                      {feature.title}
                    </Text>
                    <Text fz={14} lh={1.55} c="rgba(23,21,15,.65)">
                      {feature.description}
                    </Text>
                  </Stack>
                </Card>
              )
            })}
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
                  Поставьте постинг на автопилот
                </Text>
                <Text fz={{ base: 14, sm: 14.5 }} c="rgba(246,244,239,.65)">
                  Бесплатный тариф — без срока действия и без карты.
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

      <MarketingFooter />
    </Box>
  )
}
