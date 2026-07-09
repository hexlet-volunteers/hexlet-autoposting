import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { IconAlertTriangle, IconCheck, IconFileInvoice } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { applyPlan, useSubscription } from '@/entities/subscription'

/**
 * Глобальная модалка апгрейда тарифа. Состояние открытия приходит пропсами
 * от хоста модалок (widgets/app-shell), монтируется один раз интегратором.
 *
 * Трёхшаговый флоу (Mantine Stepper): выбор тарифа → оплата → готово. Всё локальное и
 * демо: тарифы захардкожены (страницу /pricing НЕ импортируем), данные карты не сохраняем.
 * После успешной «оплаты» тариф и лимиты применяются к мок-подписке (entities/subscription).
 */

const BRAND = '#2B50EC'
const GREEN = '#1E7F4F'
const BORDER = 'rgba(23,21,15,.13)'
const PANEL = '#F6F4EF'

type BillingPeriod = 'monthly' | 'yearly'

interface Plan {
  /** Идентификатор для выбора. */
  id: string
  /** Название тарифа. */
  name: string
  /** Базовая цена в месяц (₽); 0 — бесплатный тариф. */
  monthly: number
  /** Короткая подпись под ценой. */
  note: string
  /** Список включённых возможностей. */
  feats: string[]
  /** Лимиты тарифа для мок-подписки; Infinity — безлимит постов на платных тарифах. */
  limits: { aiRequests: number; scheduledPosts: number }
  /** Рекомендуемый тариф (выделяется рамкой и бейджем). */
  featured?: boolean
}

// Локальный мок тарифов — не импортируем страницу тарифов, слайс самодостаточен.
const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Бесплатный',
    monthly: 0,
    note: 'навсегда',
    feats: ['3 соцсети', '10 постов в месяц', '1 проект', '5 ИИ-текстов в месяц'],
    limits: { aiRequests: 5, scheduledPosts: 10 },
  },
  {
    id: 'start',
    name: 'Старт',
    monthly: 490,
    note: '7 дней бесплатно',
    featured: true,
    feats: ['7 соцсетей', 'Посты без лимита', '1 проект', '50 ИИ-текстов в месяц'],
    limits: { aiRequests: 50, scheduledPosts: Infinity },
  },
  {
    id: 'pro',
    name: 'Про',
    monthly: 990,
    note: '7 дней бесплатно',
    feats: ['Всё из «Старта»', '5 проектов', 'Команда из 3 человек', 'Согласование постов'],
    limits: { aiRequests: 50, scheduledPosts: Infinity },
  },
]

// Мок платёжного шлюза: карта с номером, оканчивающимся на «0000», всегда даёт
// ошибку оплаты (детерминированно для демо и ревью), любой другой номер — успех.
const FAIL_CARD_SUFFIX = '0000'
/** Задержка мок-«оплаты», мс — имитация запроса к шлюзу. */
const PAY_DELAY = 700

/** Цена за месяц с учётом периода (годовой — со скидкой 20%). */
function monthlyPrice(plan: Plan, period: BillingPeriod): number {
  if (plan.monthly === 0) return 0
  return period === 'yearly' ? Math.round(plan.monthly * 0.8) : plan.monthly
}

/** Итоговая сумма платежа: за месяц или за год (12 мес по годовой цене). */
function totalPrice(plan: Plan, period: BillingPeriod): number {
  return monthlyPrice(plan, period) * (period === 'yearly' ? 12 : 1)
}

function formatRub(value: number): string {
  return `${value.toLocaleString('ru-RU')} ₽`
}

interface UpgradePlanModalProps {
  opened: boolean
  onClose: () => void
}

export function UpgradePlanModal({ opened, onClose }: UpgradePlanModalProps) {
  // Текущий тариф — из мок-подписки: после успешной «оплаты» бейдж обновится сам
  const { data: subscription } = useSubscription()

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size="lg"
      title={
        <Group gap={10} wrap="nowrap">
          <Text fw={800} fz={18} style={{ letterSpacing: '-.2px' }}>
            Апгрейд тарифа
          </Text>
          <Badge color="gray" variant="light" radius="xl" tt="none" fw={600}>
            сейчас: {subscription.plan}
          </Badge>
        </Group>
      }
    >
      <UpgradeFlow onClose={onClose} />
    </Modal>
  )
}

interface UpgradeFlowProps {
  onClose: () => void
}

/** Статус мок-оплаты на шаге 2. */
type PayStatus = 'idle' | 'loading' | 'error'

/**
 * Трёхшаговый флоу апгрейда. Живёт в детях модалки: Mantine размонтирует их при
 * закрытии, поэтому каждое открытие начинается с шага 0 (и без «залипшей» ошибки
 * оплаты) без ручного сброса.
 */
function UpgradeFlow({ onClose }: UpgradeFlowProps) {
  const queryClient = useQueryClient()
  const { data: subscription } = useSubscription()
  const [step, setStep] = useState(0)
  const [period, setPeriod] = useState<BillingPeriod>('monthly')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Номер карты держим только в локальном состоянии ради демо-правила «...0000 = ошибка»;
  // никуда не сохраняем и не логируем.
  const [cardNumber, setCardNumber] = useState('')
  const [payStatus, setPayStatus] = useState<PayStatus>('idle')
  const payTimer = useRef<number | null>(null)

  // Модалка может закрыться во время «оплаты» — гасим таймер, чтобы результат не применился
  useEffect(
    () => () => {
      if (payTimer.current != null) window.clearTimeout(payTimer.current)
    },
    [],
  )

  const selectedPlan = PLANS.find((p) => p.id === selectedId) ?? null

  const periodNote = period === 'yearly' ? 'на год' : 'на месяц'
  const totalLabel = selectedPlan ? formatRub(totalPrice(selectedPlan, period)) : ''

  const pickPlan = (id: string) => {
    setSelectedId(id)
    setStep(1)
  }

  // Навигация между шагами сбрасывает результат прошлой попытки оплаты
  const goToStep = (next: number) => {
    setPayStatus('idle')
    setStep(next)
  }

  const pay = () => {
    if (!selectedPlan || payStatus === 'loading') return
    setPayStatus('loading')
    // TODO (Design First, backlog #204): POST /billing/subscription { plan, period, paymentMethod }.
    // Данные карты на фронте НЕ храним — они уходят напрямую в платёжный шлюз.
    payTimer.current = window.setTimeout(() => {
      // Демо-правило: номер карты, оканчивающийся на «0000», — ошибка оплаты, иначе успех
      if (cardNumber.replace(/\D/g, '').endsWith(FAIL_CARD_SUFFIX)) {
        setPayStatus('error')
        return
      }
      // Успех: применяем тариф к мок-подписке — сайдбар и квоты обновляются сразу
      applyPlan(queryClient, {
        plan: selectedPlan.name,
        limits: selectedPlan.limits,
        renewsAt: dayjs()
          .add(1, period === 'yearly' ? 'year' : 'month')
          .format('YYYY-MM-DD'),
      })
      notifications.show({ color: 'green', message: 'Тариф изменён (демо)' })
      setPayStatus('idle')
      setStep(2)
    }, PAY_DELAY)
  }

  return (
    <>
      <Stepper active={step} onStepClick={goToStep} size="sm" allowNextStepsSelect={false} mb="lg">
        <Stepper.Step
          label="Выбор тарифа"
          allowStepSelect={step === 1 && payStatus !== 'loading'}
        />
        <Stepper.Step label="Оплата" allowStepSelect={false} />
        <Stepper.Step label="Готово" allowStepSelect={false} />
      </Stepper>

      {/* ШАГ 1 — Выбор тарифа */}
      {step === 0 && (
        <Stack gap="md">
          <Group>
            <SegmentedControl
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
                      <Text component="span" fw={700} c={GREEN}>
                        −20%
                      </Text>
                    </span>
                  ),
                },
              ]}
            />
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
            {PLANS.map((plan) => {
              const selected = plan.id === selectedId
              return (
                <Card
                  key={plan.id}
                  withBorder
                  radius="md"
                  p="md"
                  style={{
                    position: 'relative',
                    borderColor: selected || plan.featured ? BRAND : BORDER,
                    borderWidth: selected || plan.featured ? 2 : 1.5,
                  }}
                >
                  <Stack gap={4} h="100%">
                    {plan.featured && (
                      <Badge
                        color="brand"
                        radius="xl"
                        tt="none"
                        fw={700}
                        style={{ position: 'absolute', top: -10, left: 14 }}
                      >
                        Популярный
                      </Badge>
                    )}

                    <Text fz={14.5} fw={700}>
                      {plan.name}
                    </Text>

                    <Text fz={24} fw={800} style={{ letterSpacing: '-.4px' }}>
                      {formatRub(monthlyPrice(plan, period))}
                      <Text component="span" fz={12} fw={600} c="rgba(23,21,15,.5)">
                        {' '}
                        /мес
                      </Text>
                    </Text>

                    <Text fz={11.5} c="rgba(23,21,15,.5)">
                      {plan.note}
                    </Text>

                    <Stack gap={7} mt={10} mb={14}>
                      {plan.feats.map((feat) => (
                        <Group key={feat} gap={8} align="flex-start" wrap="nowrap">
                          <IconCheck
                            size={12}
                            stroke={3}
                            color={GREEN}
                            style={{ flex: 'none', marginTop: 4 }}
                          />
                          <Text fz={12.5} lh={1.4} c="rgba(23,21,15,.75)">
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
                      onClick={() => pickPlan(plan.id)}
                    >
                      Выбрать {plan.name}
                    </Button>
                  </Stack>
                </Card>
              )
            })}
          </SimpleGrid>
        </Stack>
      )}

      {/* ШАГ 2 — Оплата */}
      {step === 1 && selectedPlan && (
        <Stack gap="md">
          <Group
            gap={10}
            wrap="nowrap"
            style={{ background: PANEL, borderRadius: 11, padding: '12px 15px' }}
          >
            <Text fz={13.5} fw={700}>
              Тариф {selectedPlan.name}
            </Text>
            <Text fz={12.5} c="rgba(23,21,15,.55)">
              {periodNote}
            </Text>
            <Text ml="auto" fz={15} fw={800}>
              {totalLabel}
            </Text>
          </Group>

          <TextInput
            label="Номер карты"
            placeholder="2200 1234 5678 9012"
            inputMode="numeric"
            value={cardNumber}
            onChange={(event) => setCardNumber(event.currentTarget.value)}
            styles={{ input: { letterSpacing: 1 } }}
          />

          <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
            <TextInput label="Срок действия" placeholder="12 / 27" inputMode="numeric" />
            <TextInput label="CVC" placeholder="•••" type="password" inputMode="numeric" />
          </SimpleGrid>

          <Alert
            variant="light"
            color="gray"
            radius="md"
            icon={<IconFileInvoice size={18} />}
            styles={{ message: { fontSize: 13 } }}
          >
            Или оплата по счёту для юрлиц — пришлём счёт и закрывающие документы.
          </Alert>

          {/* Ошибка мок-оплаты: остаёмся на шаге 2, данные можно поправить и повторить */}
          {payStatus === 'error' && (
            <Alert
              color="red"
              variant="light"
              radius="md"
              icon={<IconAlertTriangle size={18} />}
              styles={{ message: { fontSize: 13 } }}
            >
              Не удалось провести оплату. Проверьте данные карты и попробуйте снова.
            </Alert>
          )}

          <Group justify="space-between" mt="xs">
            <Button
              variant="subtle"
              color="gray"
              disabled={payStatus === 'loading'}
              onClick={() => goToStep(0)}
            >
              ← Назад
            </Button>
            <Button color="brand" loading={payStatus === 'loading'} onClick={pay}>
              Оплатить {totalLabel}
            </Button>
          </Group>

          <Text ta="center" fz={11.5} c="rgba(23,21,15,.45)">
            Это демо — ничего не спишется, данные карты мы не храним. Номер на ...
            {FAIL_CARD_SUFFIX} покажет ошибку оплаты.
          </Text>
        </Stack>
      )}

      {/* ШАГ 3 — Готово */}
      {step === 2 && (
        <Stack align="center" gap="sm" py="md">
          <ThemeIcon color="green" variant="light" radius="xl" size={56}>
            <IconCheck size={30} stroke={2.5} />
          </ThemeIcon>

          <Text fz={20} fw={800} ta="center" style={{ letterSpacing: '-.3px' }}>
            Тариф изменён (демо)
          </Text>

          <Text maw={380} ta="center" fz={13.5} lh={1.55} c="rgba(23,21,15,.6)">
            Тариф «{subscription.plan}» активен. Новые лимиты уже применены к проекту — можно
            подключать площадки и планировать посты без ограничений.
          </Text>

          <Button mt="sm" color="brand" onClick={onClose}>
            Готово
          </Button>
        </Stack>
      )}
    </>
  )
}
