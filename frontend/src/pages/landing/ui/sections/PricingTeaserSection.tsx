import { Anchor, Badge, Box, Button, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core'
import { Link } from 'react-router-dom'
import { useAuthModal } from '@/features/auth'
import { Section } from '../Section'

const FEATURED_BORDER = '2px solid #2B50EC'

interface Plan {
  name: string
  price: string
  priceSuffix?: string
  note: string
  features: string[]
  cta: string
  featured?: boolean
  badge?: string
}

const PLANS: Plan[] = [
  {
    name: 'Бесплатный',
    price: '0 ₽',
    note: 'навсегда',
    features: ['3 соцсети · 10 постов в месяц', '1 проект · базовый ИИ'],
    cta: 'Начать',
  },
  {
    name: 'Старт',
    price: '490 ₽',
    priceSuffix: ' /мес',
    note: 'или 392 ₽/мес при оплате за год',
    features: ['7 соцсетей · посты без лимита', '1 проект · 50 ИИ-текстов в месяц'],
    cta: 'Попробовать 7 дней',
    featured: true,
    badge: 'Выбирают чаще всего',
  },
  {
    name: 'Про',
    price: '990 ₽',
    priceSuffix: ' /мес',
    note: 'или 792 ₽/мес при оплате за год',
    features: ['5 проектов · команда из 3 человек', '200 ИИ-текстов · согласование'],
    cta: 'Выбрать',
  },
]

/** Тизер тарифов лендинга: три плана, рекомендованный выделен рамкой и бейджем. */
export function PricingTeaserSection() {
  const { open } = useAuthModal()

  return (
    <Section id="pricing" eyebrow="Тарифы" title="Простые и без звёздочек">
      <Group justify="flex-end" mt={-8}>
        <Anchor component={Link} to="/pricing" c="brand.6" fw={600} fz={14}>
          Все тарифы и сравнение →
        </Anchor>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mt="md" verticalSpacing="lg">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            withBorder
            radius="lg"
            p="lg"
            style={{
              position: 'relative',
              overflow: 'visible', // чтобы бейдж «Выбирают чаще всего» не обрезался (Card по умолчанию overflow:hidden)
              border: plan.featured ? FEATURED_BORDER : undefined,
              boxShadow: plan.featured ? '0 12px 32px rgba(43, 80, 236, 0.12)' : undefined,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {plan.badge && (
              <Badge
                color="brand"
                radius="xl"
                style={{ position: 'absolute', top: -11, left: 24, textTransform: 'none' }}
              >
                {plan.badge}
              </Badge>
            )}

            <Stack gap={6} style={{ flex: 1 }}>
              <Text fw={700} fz={15}>
                {plan.name}
              </Text>

              <Text fw={800} fz={34} style={{ letterSpacing: '-0.5px' }}>
                {plan.price}
                {plan.priceSuffix && (
                  <Text component="span" fw={600} fz={15} c="rgba(23, 21, 15, 0.5)">
                    {plan.priceSuffix}
                  </Text>
                )}
              </Text>

              <Text fz={13} c="dimmed">
                {plan.note}
              </Text>

              <Box mt={14}>
                {plan.features.map((feature) => (
                  <Text
                    key={feature}
                    fz={14}
                    c="rgba(23, 21, 15, 0.75)"
                    style={{ lineHeight: 1.9 }}
                  >
                    {feature}
                  </Text>
                ))}
              </Box>
            </Stack>

            <Button
              mt="lg"
              fullWidth
              radius="md"
              size="md"
              color="brand"
              variant={plan.featured ? 'filled' : 'default'}
              onClick={() => open('register')}
            >
              {plan.cta}
            </Button>
          </Card>
        ))}
      </SimpleGrid>
    </Section>
  )
}
