import { Badge, Button, Card, Group, Modal, SimpleGrid, Stack, Text } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'

const FEATURED_BORDER = '2px solid #2B50EC'
const CHECK_COLOR = 'var(--mantine-color-success-6)'

interface Plan {
  name: string
  price: string
  priceSuffix?: string
  note: string
  features: string[]
  featured?: boolean
  badge?: string
}

// Компактный набор тарифов для «воронки» с демо-календаря — те же планы, что в тизере лендинга.
const PLANS: Plan[] = [
  {
    name: 'Бесплатный',
    price: '0 ₽',
    note: 'навсегда',
    features: ['3 соцсети', '10 постов в месяц'],
  },
  {
    name: 'Старт',
    price: '490 ₽',
    priceSuffix: ' /мес',
    note: '7 дней бесплатно',
    features: ['7 соцсетей', 'посты без лимита', '50 ИИ-текстов в месяц'],
    featured: true,
    badge: 'Выбирают чаще',
  },
  {
    name: 'Про',
    price: '990 ₽',
    priceSuffix: ' /мес',
    note: '7 дней бесплатно',
    features: ['5 проектов', 'команда из 3 человек', '200 ИИ-текстов'],
  },
  {
    name: 'Агентство',
    price: '2490 ₽',
    priceSuffix: ' /мес',
    note: 'для агентств и команд',
    features: ['20 проектов', '10 пользователей', 'ИИ без лимита'],
  },
]

interface PlanPickerModalProps {
  opened: boolean
  onClose: () => void
  /** Пользователь выбрал тариф — дальше воронка ведёт к регистрации. */
  onChoose: (planName: string) => void
}

/**
 * Лёгкая модалка выбора тарифа для лендинга: всплывает, когда в демо-календаре
 * упёрлись в лимит добавлений. «Выбрать» по тарифу продолжает воронку регистрацией.
 * Дамб-компонент: состояние открытия и переход к регистрации — на стороне HeroSection.
 */
export function PlanPickerModal({ opened, onClose, onChoose }: PlanPickerModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size={900}
      title={
        <Stack gap={2}>
          <Text fw={800} fz="lg">
            Планируйте без ограничений
          </Text>
          <Text fz="sm" c="dimmed">
            В демо можно добавить пару постов. Выберите тариф — и продолжим в личном кабинете.
          </Text>
        </Stack>
      }
    >
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="sm" mt="xs">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            withBorder
            radius="lg"
            padding="md"
            style={{
              border: plan.featured ? FEATURED_BORDER : undefined,
            }}
          >
            <Stack gap={8} h="100%">
              {/* Бейдж — в потоке рядом с названием: без absolute/отрицательных сдвигов,
                  чтобы не обрезался краем карточки/модалки. */}
              <Group gap={8} wrap="nowrap" align="center" mih={22}>
                <Text fw={700} fz="sm">
                  {plan.name}
                </Text>
                {plan.badge ? (
                  <Badge color="brand" radius="sm" size="xs" tt="none">
                    {plan.badge}
                  </Badge>
                ) : null}
              </Group>
              <Text fz={22} fw={800} style={{ letterSpacing: '-0.4px', lineHeight: 1 }}>
                {plan.price}
                {plan.priceSuffix ? (
                  <Text component="span" fz={12} fw={600} c="dimmed">
                    {plan.priceSuffix}
                  </Text>
                ) : null}
              </Text>
              <Text fz={11.5} c="dimmed">
                {plan.note}
              </Text>
              <Stack gap={5} mt={4} mb={10}>
                {plan.features.map((f) => (
                  <Group key={f} gap={7} wrap="nowrap" align="flex-start">
                    <IconCheck size={13} stroke={3} color={CHECK_COLOR} style={{ marginTop: 3 }} />
                    <Text fz={12.5} lh={1.35}>
                      {f}
                    </Text>
                  </Group>
                ))}
              </Stack>
              <Button
                mt="auto"
                fullWidth
                radius="md"
                color="brand"
                variant={plan.featured ? 'filled' : 'default'}
                onClick={() => onChoose(plan.name)}
              >
                Выбрать
              </Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    </Modal>
  )
}
