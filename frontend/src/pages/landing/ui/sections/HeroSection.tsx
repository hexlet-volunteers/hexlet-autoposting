import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Badge,
  Box,
  Button,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { NetworkPill } from '@/shared/ui'
import { NETWORKS } from '@/shared/config'
import { useAuthModal } from '@/features/auth'

interface CalendarPost {
  networkIdx: number
  time: string
  label: string
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const START_DATE = 17
const TIMES = ['09:00', '12:00', '15:00', '19:00']
const LABELS = [
  'Анонс акции',
  'Пост-знакомство',
  'Отзыв клиента',
  'Подборка советов',
  'Бэкстейдж',
  'Розыгрыш',
  'Дайджест недели',
  'Новинка',
]

/** Каноничный стартовый контент-план (совпадает с state.a из макета landing-home). */
const INITIAL_WEEK: CalendarPost[][] = [
  [
    { networkIdx: 0, time: '09:00', label: 'Анонс акции' },
    { networkIdx: 1, time: '09:00', label: 'Утренний дайджест' },
  ],
  [{ networkIdx: 4, time: '12:00', label: 'Лонгрид про тренды' }],
  [
    { networkIdx: 0, time: '12:00', label: 'Отзыв клиента' },
    { networkIdx: 2, time: '19:00', label: 'Опрос' },
  ],
  [],
  [
    { networkIdx: 1, time: '15:00', label: 'Подборка советов' },
    { networkIdx: 6, time: '18:00', label: 'Шортс' },
  ],
  [{ networkIdx: 5, time: '11:00', label: 'Влог: бэкстейдж' }],
  [],
]

const BORDER = 'rgba(23,21,15,.1)'
const SOFT_BORDER = 'rgba(23,21,15,.09)'
const WEEKEND_COLOR = '#C4552D'

// Демо на лендинге даёт «пощупать» добавление постов, но ограниченно:
// после MAX_DEMO_ADDS добавлений «+» открывает регистрацию — дальше уже в кабинете.
const INITIAL_TOTAL = INITIAL_WEEK.reduce((sum, day) => sum + day.length, 0)
const MAX_DEMO_ADDS = 3

/** Плюрализация русских существительных: [1, 2-4, 5+]. */
function plural(n: number, forms: [string, string, string]): string {
  const a = Math.abs(n) % 100
  const b = a % 10
  if (a > 10 && a < 20) return forms[2]
  if (b > 1 && b < 5) return forms[1]
  if (b === 1) return forms[0]
  return forms[2]
}

export function HeroSection() {
  const { open } = useAuthModal()
  const [week, setWeek] = useState<CalendarPost[][]>(INITIAL_WEEK)
  const [nextSeed, setNextSeed] = useState(3)

  const addPost = (dayIdx: number) => {
    // Демо расширяется лишь на пару постов; дальше зовём регистрацию.
    const currentTotal = week.reduce((sum, day) => sum + day.length, 0)
    if (currentTotal - INITIAL_TOTAL >= MAX_DEMO_ADDS) {
      open('register')
      return
    }
    const seed = nextSeed
    setWeek((prev) => {
      const next = prev.map((day) => day.slice())
      next[dayIdx] = [
        ...next[dayIdx],
        {
          networkIdx: seed % NETWORKS.length,
          time: TIMES[(seed + dayIdx) % TIMES.length],
          label: LABELS[(seed * 3 + dayIdx) % LABELS.length],
        },
      ]
      return next
    })
    setNextSeed((s) => s + 1)
  }

  const removePost = (dayIdx: number, postIdx: number) => {
    setWeek((prev) => {
      const next = prev.map((day) => day.slice())
      next[dayIdx] = next[dayIdx].filter((_, i) => i !== postIdx)
      return next
    })
  }

  const total = week.reduce((sum, day) => sum + day.length, 0)

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
                style={{ background: 'var(--mantine-color-accent-5)', borderRadius: 8 }}
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
              <Button size="md" radius="md" color="brand" onClick={() => open('register')}>
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

          {/* Карточка контент-плана на неделю — живое демо */}
          <Box
            style={{
              background: '#fff',
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
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
                {total} {plural(total, ['пост', 'поста', 'постов'])}
              </Badge>
              <Group
                gap={4}
                ml="auto"
                p={3}
                style={{ background: 'rgba(23,21,15,.06)', borderRadius: 9 }}
              >
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
              {week.map((posts, dayIdx) => (
                <Stack
                  key={DAYS[dayIdx]}
                  gap={0}
                  style={{ background: '#fff', minHeight: 170, minWidth: 0 }}
                >
                  <Text
                    ta="center"
                    pt={9}
                    pb={7}
                    px={4}
                    fz={12}
                    fw={600}
                    c={dayIdx >= 5 ? WEEKEND_COLOR : 'rgba(23,21,15,.55)'}
                  >
                    {DAYS[dayIdx]}{' '}
                    <Text component="span" fw={500} style={{ opacity: 0.55 }}>
                      {START_DATE + dayIdx}
                    </Text>
                  </Text>

                  <Stack gap={6} px={6} pb={8} style={{ flex: 1 }}>
                    {posts.map((post, postIdx) => {
                      const network = NETWORKS[post.networkIdx]
                      return (
                        <UnstyledButton
                          key={`${network.id}-${post.time}-${postIdx}`}
                          onClick={() => removePost(dayIdx, postIdx)}
                          title="Нажмите, чтобы удалить"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            width: '100%',
                            textAlign: 'left',
                            padding: 7,
                            borderRadius: 8,
                            border: `1px solid ${network.color}59`,
                            background: `${network.color}14`,
                            cursor: 'pointer',
                          }}
                        >
                          <Group gap={5} wrap="nowrap">
                            <NetworkPill network={network} variant="badge" />
                            <Text fz={10} fw={600} c="rgba(23,21,15,.5)">
                              {post.time}
                            </Text>
                          </Group>
                          <Text fz={11} fw={600} lh={1.25} c="rgba(23,21,15,.85)" truncate>
                            {post.label}
                          </Text>
                        </UnstyledButton>
                      )
                    })}

                    <Button
                      variant="default"
                      radius="md"
                      size="compact-sm"
                      c="rgba(23,21,15,.4)"
                      onClick={() => addPost(dayIdx)}
                      style={{
                        border: '1.5px dashed rgba(23,21,15,.18)',
                        background: 'transparent',
                      }}
                    >
                      <IconPlus size={16} stroke={2.5} />
                    </Button>
                  </Stack>
                </Stack>
              ))}
            </SimpleGrid>

            <Box px={18} py={9} style={{ borderTop: `1px solid ${SOFT_BORDER}` }}>
              <Text fz={12} c="rgba(23,21,15,.48)">
                Живое демо: «+» добавляет пост, клик по посту — удаляет
              </Text>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
