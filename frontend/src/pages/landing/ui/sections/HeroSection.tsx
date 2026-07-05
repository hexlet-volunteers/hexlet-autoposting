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
  Title,
} from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { NetworkPill } from '@/shared/ui'
import { NETWORKS } from '@/shared/config/networks'
import type { Network } from '@/shared/config/networks'

const networkById = (id: string): Network => {
  const found = NETWORKS.find((n) => n.id === id)
  if (!found) throw new Error(`Unknown network: ${id}`)
  return found
}

interface CalendarPost {
  network: Network
  time: string
  label: string
}

interface CalendarDay {
  name: string
  date: string
  posts: CalendarPost[]
}

const WEEK: CalendarDay[] = [
  {
    name: 'Пн',
    date: '17',
    posts: [{ network: networkById('tg'), time: '10:00', label: 'Анонс недели' }],
  },
  {
    name: 'Вт',
    date: '18',
    posts: [{ network: networkById('vk'), time: '12:30', label: 'Полезный совет' }],
  },
  {
    name: 'Ср',
    date: '19',
    posts: [
      { network: networkById('dzen'), time: '09:00', label: 'Статья дня' },
      { network: networkById('ok'), time: '18:00', label: 'Опрос' },
    ],
  },
  {
    name: 'Чт',
    date: '20',
    posts: [{ network: networkById('max'), time: '11:15', label: 'Кейс клиента' }],
  },
  {
    name: 'Пт',
    date: '21',
    posts: [
      { network: networkById('youtube'), time: '15:00', label: 'Новое видео' },
      { network: networkById('tg'), time: '20:00', label: 'Итоги недели' },
    ],
  },
  {
    name: 'Сб',
    date: '22',
    posts: [{ network: networkById('rutube'), time: '13:00', label: 'Обзор' }],
  },
  {
    name: 'Вс',
    date: '23',
    posts: [],
  },
]

const BORDER = 'rgba(23,21,15,.1)'
const SOFT_BORDER = 'rgba(23,21,15,.09)'

export function HeroSection() {
  return (
    <Box component="section">
      <Container size="lg" py={{ base: 48, sm: 72 }}>
        <Stack gap={40}>
          {/* Заголовочный блок */}
          <Stack gap={0} maw={720} mx="auto" ta="center" align="center">
            <Badge
              size="lg"
              radius="xl"
              variant="outline"
              color="gray"
              styles={{
                root: {
                  borderColor: 'rgba(23,21,15,.2)',
                  color: 'rgba(23,21,15,.65)',
                  textTransform: 'none',
                  letterSpacing: '.3px',
                  fontWeight: 600,
                },
              }}
            >
              Автопостинг · кросспостинг · 7 площадок
            </Badge>

            <Title
              order={1}
              mt={18}
              fz={{ base: 34, sm: 46 }}
              fw={800}
              lh={1.08}
              style={{ letterSpacing: '-.8px', textWrap: 'balance' }}
            >
              Посты выходят{' '}
              <Box
                component="span"
                px={8}
                style={{ background: '#FFD84D', borderRadius: 8 }}
              >
                сами
              </Box>{' '}
              — даже когда вы спите
            </Title>

            <Text mt={18} fz={{ base: 15.5, sm: 16.5 }} lh={1.55} c="rgba(23,21,15,.7)">
              Соберите контент-план один раз — Отложка опубликует всё точно в срок: ВКонтакте,
              Telegram, Дзен и ещё четыре площадки.
            </Text>

            <Group gap={12} mt={26} justify="center">
              <Button component={Link} to="/login" size="md" radius="md" color="brand">
                Попробовать бесплатно
              </Button>
              <Button
                component={Link}
                to="#how"
                size="md"
                radius="md"
                variant="outline"
                color="dark"
              >
                Как это работает
              </Button>
            </Group>

            <Text mt={14} fz={13} c="rgba(23,21,15,.5)">
              Бесплатный тариф навсегда · Карта не нужна
            </Text>
          </Stack>

          {/* Карточка контент-плана на неделю */}
          <Card
            withBorder
            radius="lg"
            p={0}
            style={{
              borderColor: BORDER,
              boxShadow: '0 12px 32px rgba(23,21,15,.08)',
              overflow: 'hidden',
            }}
          >
            <Group gap={12} align="center" px={18} py={14} wrap="wrap">
              <Text fz={15} fw={700}>
                Контент-план · 17–23 ноября
              </Text>
              <Badge
                radius="xl"
                variant="light"
                color="brand"
                styles={{ root: { textTransform: 'none', fontWeight: 600 } }}
              >
                9 постов
              </Badge>
              <Group gap={4} ml="auto" p={3} style={{ background: 'rgba(23,21,15,.06)', borderRadius: 9 }}>
                <Box
                  px={10}
                  py={4}
                  style={{ background: '#17150F', color: '#fff', borderRadius: 7 }}
                >
                  <Text fz={12} fw={600}>
                    Неделя
                  </Text>
                </Box>
                <Box px={10} py={4}>
                  <Text fz={12} fw={600} c="rgba(23,21,15,.5)">
                    Месяц
                  </Text>
                </Box>
              </Group>
            </Group>

            <SimpleGrid
              cols={{ base: 2, xs: 4, sm: 7 }}
              spacing={1}
              verticalSpacing={1}
              style={{ background: SOFT_BORDER, borderTop: `1px solid ${SOFT_BORDER}` }}
            >
              {WEEK.map((day) => (
                <Stack
                  key={day.date}
                  gap={0}
                  style={{ background: '#fff', minHeight: 170, minWidth: 0 }}
                >
                  <Text ta="center" pt={9} pb={7} px={4} fz={12} fw={600}>
                    {day.name}{' '}
                    <Text component="span" fw={500} c="rgba(23,21,15,.55)">
                      {day.date}
                    </Text>
                  </Text>

                  <Stack gap={6} px={6} pb={8} style={{ flex: 1 }}>
                    {day.posts.map((post) => (
                      <Card
                        key={`${post.network.id}-${post.time}`}
                        p={7}
                        radius="md"
                        withBorder
                        style={{ borderColor: BORDER }}
                      >
                        <Group gap={5} wrap="nowrap" mb={3}>
                          <NetworkPill network={post.network} variant="badge" />
                          <Text fz={10} fw={600} c="rgba(23,21,15,.5)">
                            {post.time}
                          </Text>
                        </Group>
                        <Text
                          fz={11}
                          fw={600}
                          lh={1.25}
                          c="rgba(23,21,15,.85)"
                          truncate
                        >
                          {post.label}
                        </Text>
                      </Card>
                    ))}

                    <Button
                      variant="default"
                      radius="md"
                      size="compact-sm"
                      c="rgba(23,21,15,.4)"
                      style={{ border: '1.5px dashed rgba(23,21,15,.18)', background: 'transparent' }}
                    >
                      <IconPlus size={16} stroke={2.5} />
                    </Button>
                  </Stack>
                </Stack>
              ))}
            </SimpleGrid>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}
