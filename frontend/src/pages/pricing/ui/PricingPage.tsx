import { useState } from 'react'
import {
  Accordion,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { MarketingHeader } from '@/widgets/marketing-header'
import { MarketingFooter } from '@/widgets/marketing-footer'
import { useAuthModal } from '@/features/auth'

const BRAND = '#2B50EC'
const INK = '#17150F'
const BORDER = 'rgba(23,21,15,.12)'

type BillingPeriod = 'monthly' | 'yearly'

interface Plan {
  /** Название тарифа. */
  name: string
  /** Базовая цена в месяц (₽); 0 — бесплатный тариф. */
  monthly: number
  /** Подпись на кнопке действия. */
  cta: string
  /** Список включённых возможностей. */
  feats: string[]
  /** Рекомендуемый тариф (выделяется рамкой и бейджем). */
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'Бесплатный',
    monthly: 0,
    cta: 'Начать',
    feats: [
      '3 соцсети',
      '10 постов в месяц',
      '1 проект',
      '5 ИИ-текстов в месяц',
      'Поддержка в чате',
    ],
  },
  {
    name: 'Старт',
    monthly: 490,
    cta: 'Попробовать 7 дней',
    featured: true,
    feats: [
      '7 соцсетей',
      'Посты без лимита',
      '1 проект',
      '50 ИИ-текстов в месяц',
      'Лучшее время публикации',
    ],
  },
  {
    name: 'Про',
    monthly: 990,
    cta: 'Попробовать 7 дней',
    feats: [
      'Всё из «Старта»',
      '5 проектов',
      'Команда из 3 человек',
      '200 ИИ-текстов в месяц',
      'Согласование постов',
      'Автоповторы',
    ],
  },
  {
    name: 'Агентство',
    monthly: 2490,
    cta: 'Написать нам',
    feats: [
      'Всё из «Про»',
      '20 проектов',
      '10 пользователей',
      'ИИ без лимита',
      'Отчёты для клиентов',
      'Личный менеджер',
    ],
  },
]

interface ComparisonRow {
  /** Название строки-возможности. */
  name: string
  /** Значения по колонкам: Бесплатный, Старт, Про, Агентство. */
  values: [string, string, string, string]
}

const COMPARISON_COLUMNS = ['Бесплатный', 'Старт', 'Про', 'Агентство'] as const

const COMPARISON_ROWS: ComparisonRow[] = [
  { name: 'Соцсети', values: ['3', '7', '7', '7'] },
  { name: 'Постов в месяц', values: ['10', 'Без лимита', 'Без лимита', 'Без лимита'] },
  { name: 'Проекты', values: ['1', '1', '5', '20'] },
  { name: 'Пользователи', values: ['1', '1', '3', '10'] },
  { name: 'ИИ-тексты в месяц', values: ['5', '50', '200', 'Без лимита'] },
  { name: 'Лучшее время публикации', values: ['—', '✓', '✓', '✓'] },
  { name: 'Автоповторы постов', values: ['—', '—', '✓', '✓'] },
  { name: 'Согласование и роли', values: ['—', '—', '✓', '✓'] },
  { name: 'Отчёты по публикациям', values: ['—', 'Базовые', 'Расширенные', 'Для клиентов'] },
  { name: 'Поддержка', values: ['Чат', 'Чат', 'Приоритетная', 'Личный менеджер'] },
]

interface Faq {
  q: string
  a: string
}

const FAQ: Faq[] = [
  {
    q: 'Какие способы оплаты?',
    a: 'Карты российских банков и СБП. Для юрлиц и ИП — оплата по счёту с закрывающими документами.',
  },
  {
    q: 'Можно ли сменить тариф в середине месяца?',
    a: 'Да, в любой момент. Неиспользованный остаток автоматически зачтём в счёт нового тарифа.',
  },
  {
    q: 'А если не подойдёт?',
    a: 'В течение 14 дней после оплаты вернём деньги без вопросов — просто напишите в поддержку.',
  },
]

/** Индекс рекомендованной колонки в таблице сравнения (совпадает с featured-тарифом). */
const FEATURED_COLUMN = PLANS.findIndex((plan) => plan.featured)

function yearlyMonthly(monthly: number): number {
  return Math.round(monthly * 0.8)
}

function formatPrice(plan: Plan, period: BillingPeriod): string {
  if (plan.monthly === 0) return '0 ₽'
  const value = period === 'yearly' ? yearlyMonthly(plan.monthly) : plan.monthly
  return `${value} ₽`
}

function formatNote(plan: Plan, period: BillingPeriod): string {
  if (plan.monthly === 0) return 'навсегда'
  if (period === 'yearly') return 'при оплате за год'
  return `${yearlyMonthly(plan.monthly)} ₽/мес при оплате за год`
}

export function PricingPage() {
  const { open } = useAuthModal()
  const [period, setPeriod] = useState<BillingPeriod>('monthly')

  return (
    <Box style={{ background: '#F6F4EF', color: INK }}>
      <MarketingHeader />

      {/* Hero: заголовок, подзаголовок и переключатель периода */}
      <Box component="section">
        <Container size="lg" pt={{ base: 40, sm: 56 }} pb={{ base: 8, sm: 8 }}>
          <Stack gap={0} align="center" ta="center">
            <Title
              order={1}
              fz={{ base: 32, sm: 42 }}
              fw={800}
              lh={1.1}
              style={{ letterSpacing: '-.7px', textWrap: 'balance' }}
            >
              Тарифы простые и без звёздочек
            </Title>
            <Text mt={14} maw={560} fz={16} lh={1.55} c="rgba(23,21,15,.65)">
              Начните бесплатно, растите по мере надобности. Смена тарифа — в любой момент, остаток
              пересчитаем автоматически.
            </Text>

            <SegmentedControl
              mt={24}
              radius="md"
              value={period}
              onChange={(value) => setPeriod(value as BillingPeriod)}
              data={[
                { value: 'monthly', label: 'Помесячно' },
                {
                  value: 'yearly',
                  label: (
                    <span>
                      На год{' '}
                      <Text component="span" fw={700} c="#1E7F4F">
                        −20%
                      </Text>
                    </span>
                  ),
                },
              ]}
            />
          </Stack>
        </Container>
      </Box>

      {/* Карточки тарифов */}
      <Box component="section">
        <Container size="lg" pt={{ base: 28, sm: 36 }} pb={{ base: 16, sm: 24 }}>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={16} verticalSpacing={16}>
            {PLANS.map((plan) => (
              <Card
                key={plan.name}
                withBorder
                radius="lg"
                p="lg"
                style={{
                  overflow: 'visible',
                  position: 'relative',
                  background: '#fff',
                  borderColor: plan.featured ? BRAND : BORDER,
                  borderWidth: plan.featured ? 2 : 1,
                  boxShadow: plan.featured ? '0 12px 32px rgba(43,80,236,.12)' : 'none',
                }}
              >
                {plan.featured && (
                  <Badge
                    color="brand"
                    radius="xl"
                    style={{
                      position: 'absolute',
                      top: -11,
                      left: 20,
                      textTransform: 'none',
                      fontWeight: 700,
                    }}
                  >
                    Выбирают чаще всего
                  </Badge>
                )}

                <Stack gap={6} h="100%">
                  <Text fz={15} fw={700}>
                    {plan.name}
                  </Text>

                  <Text fz={32} fw={800} style={{ letterSpacing: '-.5px' }}>
                    {formatPrice(plan, period)}
                    {plan.monthly !== 0 && (
                      <Text component="span" fz={14} fw={600} c="rgba(23,21,15,.5)">
                        {' '}
                        /мес
                      </Text>
                    )}
                  </Text>

                  <Text fz={12.5} c="rgba(23,21,15,.55)" mih={16}>
                    {formatNote(plan, period)}
                  </Text>

                  <Stack gap={9} mt={14} mb={18}>
                    {plan.feats.map((feat) => (
                      <Group key={feat} gap={9} align="flex-start" wrap="nowrap">
                        <IconCheck
                          size={14}
                          stroke={3}
                          color="#1E7F4F"
                          style={{ flex: 'none', marginTop: 3 }}
                        />
                        <Text fz={13.5} lh={1.45} c="rgba(23,21,15,.78)">
                          {feat}
                        </Text>
                      </Group>
                    ))}
                  </Stack>

                  <Button
                    mt="auto"
                    fullWidth
                    radius="md"
                    color="brand"
                    variant={plan.featured ? 'filled' : 'outline'}
                    onClick={() => open('register')}
                  >
                    {plan.cta}
                  </Button>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>

          <Text mt={16} ta="center" fz={13} c="rgba(23,21,15,.5)">
            Для юрлиц — оплата по счёту и закрывающие документы. НДС не облагается.
          </Text>
        </Container>
      </Box>

      {/* Полное сравнение тарифов */}
      <Box component="section">
        <Container size="lg" py={{ base: 48, sm: 56 }}>
          <Title order={2} fz={{ base: 24, sm: 28 }} fw={800} style={{ letterSpacing: '-.4px' }}>
            Что входит в каждый тариф
          </Title>

          <Box
            mt={22}
            style={{
              overflowX: 'auto',
              background: '#fff',
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
            }}
          >
            <Table
              miw={640}
              verticalSpacing="sm"
              horizontalSpacing="md"
              withRowBorders
              style={{ borderCollapse: 'collapse' }}
            >
              <Table.Thead style={{ background: '#F6F4EF' }}>
                <Table.Tr>
                  <Table.Th style={{ width: '30%' }} />
                  {COMPARISON_COLUMNS.map((col, index) => (
                    <Table.Th
                      key={col}
                      ta="center"
                      style={{
                        fontWeight: index === FEATURED_COLUMN ? 800 : 700,
                        color: index === FEATURED_COLUMN ? BRAND : INK,
                      }}
                    >
                      {col}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {COMPARISON_ROWS.map((row) => (
                  <Table.Tr key={row.name}>
                    <Table.Td style={{ fontSize: 14, fontWeight: 600 }}>{row.name}</Table.Td>
                    {row.values.map((value, index) => (
                      <Table.Td
                        key={`${row.name}-${COMPARISON_COLUMNS[index]}`}
                        ta="center"
                        style={{
                          fontSize: 13.5,
                          fontWeight: index === FEATURED_COLUMN ? 600 : 400,
                          color: index === FEATURED_COLUMN ? INK : 'rgba(23,21,15,.65)',
                          background: index === FEATURED_COLUMN ? 'rgba(43,80,236,.04)' : undefined,
                        }}
                      >
                        {value}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        </Container>
      </Box>

      {/* FAQ про оплату */}
      <Box component="section">
        <Container size="lg" pt={{ base: 8, sm: 8 }} pb={{ base: 48, sm: 64 }}>
          <Title order={2} fz={{ base: 24, sm: 28 }} fw={800} style={{ letterSpacing: '-.4px' }}>
            Вопросы про оплату
          </Title>

          <Box maw={760} mt={16}>
            {/* Без defaultValue: по макету все вопросы свёрнуты, пока пользователь не кликнет */}
            <Accordion variant="default" chevronPosition="right">
              {FAQ.map((item, index) => (
                <Accordion.Item key={item.q} value={String(index)}>
                  <Accordion.Control>
                    <Text fw={600} fz={16} c={INK}>
                      {item.q}
                    </Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Text c="dimmed" fz={{ base: 14, sm: 14.5 }} lh={1.6}>
                      {item.a}
                    </Text>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </Box>
        </Container>
      </Box>

      {/* Финальный CTA-баннер */}
      <Box component="section" py={{ base: 40, sm: 56 }}>
        <Container size="lg">
          <Box
            p={{ base: 28, sm: 40 }}
            style={{ background: INK, borderRadius: 20, color: '#F6F4EF' }}
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
                  Не уверены? Начните с бесплатного
                </Text>
                <Text fz={{ base: 14, sm: 14.5 }} c="rgba(246,244,239,.65)">
                  10 постов в месяц — хватит, чтобы понять, ваше ли это. Карта не нужна.
                </Text>
              </Stack>

              <Button
                size="md"
                radius="md"
                onClick={() => open('register')}
                styles={{
                  root: {
                    background: 'var(--mantine-color-accent-5)',
                    color: INK,
                    fontWeight: 700,
                  },
                }}
              >
                Создать аккаунт
              </Button>
            </Group>
          </Box>
        </Container>
      </Box>

      <MarketingFooter />
    </Box>
  )
}
