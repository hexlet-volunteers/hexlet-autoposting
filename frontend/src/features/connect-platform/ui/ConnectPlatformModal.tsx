import { useRef, useState } from 'react'
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  CloseButton,
  Divider,
  Group,
  Modal,
  Radio,
  Stack,
  Text,
} from '@mantine/core'
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { NETWORKS } from '@/shared/config'
import type { Network } from '@/shared/config'
import { NetworkPill } from '@/shared/ui'
import { connectionKeys, useConnections } from '@/entities/platform-account'
import type { Connection } from '@/entities/platform-account'
import {
  getConnectErrorMessage,
  mockAuthorize,
  mockConfirmTarget,
  mockDisconnect,
} from '../api/mockConnectApi'
import type { ConnectTarget } from '../api/mockConnectApi'

// Тона текста из макета app-dashboard, блок data-screen-label="Подключение площадки"
const TEXT_BODY = 'rgba(23,21,15,.65)'
const TEXT_STEP = 'rgba(23,21,15,.6)'
const TEXT_HINT = 'rgba(23,21,15,.45)'
/** Красный деструктивной кнопки «Отключить» — из макета */
const DANGER_COLOR = '#C4352D'

// Full-width кнопки действия по макету: padding 13px, скругление 11
const ACTION_BUTTON_STYLES = {
  root: { height: 'auto', paddingBlock: 13, borderRadius: 11, fontSize: 14, fontWeight: 700 },
} as const

/** Шаги подключения — дословно из макета */
const CONNECT_STEPS = [
  'Авторизуетесь на стороне площадки — пароль нам не передаётся',
  'Выбираете сообщество или канал для публикаций',
  'Готово — площадка появится в календаре',
]

interface ConnectPlatformModalProps {
  opened: boolean
  /** Площадка, для которой открыта модалка; null — общий список всех площадок */
  networkId: string | null
  onClose: () => void
}

/**
 * Глобальная модалка подключения площадок. Состояние открытия и networkId приходят
 * пропсами от хоста модалок (widgets/app-shell). С networkId — модалка одной площадки
 * (режим подключения или отключения), без — общий список всех 7 площадок.
 * Всё per-open состояние живёт в детях: Mantine размонтирует их при закрытии.
 */
export function ConnectPlatformModal({ opened, networkId, onClose }: ConnectPlatformModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      size="md"
      padding={24}
      withCloseButton={false}
    >
      <ConnectPlatformContent initialNetworkId={networkId} onClose={onClose} />
    </Modal>
  )
}

interface ConnectPlatformContentProps {
  initialNetworkId: string | null
  onClose: () => void
}

/**
 * Содержимое модалки: либо панель конкретной площадки, либо общий список,
 * из которого можно провалиться в панель (со стрелкой «назад»).
 */
function ConnectPlatformContent({ initialNetworkId, onClose }: ConnectPlatformContentProps) {
  const { data: connections } = useConnections()
  const [activeId, setActiveId] = useState<string | null>(initialNetworkId)

  const network = NETWORKS.find((n) => n.id === activeId)

  if (!network) {
    return <NetworkList connections={connections} onPick={setActiveId} onClose={onClose} />
  }

  const connection = connections.find((c) => c.networkId === network.id)

  return (
    <PlatformPanel
      // Смена площадки полностью сбрасывает состояние панели
      key={network.id}
      network={network}
      connected={connection?.connected ?? false}
      onBack={initialNetworkId === null ? () => setActiveId(null) : undefined}
      onClose={onClose}
    />
  )
}

interface NetworkListProps {
  connections: Connection[]
  onPick: (networkId: string) => void
  onClose: () => void
}

/** Общий список всех площадок: кнопка в строке открывает панель подключения/отключения. */
function NetworkList({ connections, onPick, onClose }: NetworkListProps) {
  const byId = new Map(connections.map((c) => [c.networkId, c]))

  return (
    <Stack gap={0}>
      <ModalHeader title="Подключение площадок" onClose={onClose} />

      <Stack gap={0} mt="sm">
        {NETWORKS.map((network, index) => {
          const conn = byId.get(network.id)
          const connected = conn?.connected ?? false

          return (
            <div key={network.id}>
              {index > 0 && <Divider my="sm" />}
              <Group justify="space-between" wrap="nowrap" gap="sm">
                <Stack gap={4} style={{ minWidth: 0 }}>
                  <NetworkPill network={network} />
                  {connected && conn?.account && (
                    <Text size="xs" c="dimmed" style={{ paddingLeft: 6 }}>
                      {conn.account}
                    </Text>
                  )}
                </Stack>

                <Button
                  variant="light"
                  color={connected ? 'red' : 'brand'}
                  size="xs"
                  onClick={() => onPick(network.id)}
                >
                  {connected ? 'Отключить' : 'Подключить'}
                </Button>
              </Group>
            </div>
          )
        })}
      </Stack>

      <DemoHint />
    </Stack>
  )
}

interface PlatformPanelProps {
  network: Network
  connected: boolean
  /** Возврат к общему списку — есть только если панель открыта из него */
  onBack?: () => void
  onClose: () => void
}

/**
 * Панель одной площадки. Режим фиксируется на момент открытия:
 * не подключена → шаги подключения, «OAuth» и выбор сообщества/канала;
 * подключена → предупреждение и красная кнопка отключения.
 */
function PlatformPanel({ network, connected, onBack, onClose }: PlatformPanelProps) {
  const queryClient = useQueryClient()

  // Режим не меняем на лету, чтобы панель не «перещёлкивалась» после мутации мок-кэша
  const [mode] = useState<'connect' | 'disconnect'>(connected ? 'disconnect' : 'connect')
  const [step, setStep] = useState<'intro' | 'choose'>('intro')
  const [targets, setTargets] = useState<ConnectTarget[]>([])
  const [targetId, setTargetId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Счётчик попыток «OAuth» — нужен мок-триггеру ошибки (повторная попытка успешна)
  const attemptRef = useRef(0)

  // «OAuth»-авторизация: по успеху получаем список сообществ/каналов и шаг выбора
  const runAuthorize = async () => {
    setLoading(true)
    setError(null)
    attemptRef.current += 1
    try {
      const available = await mockAuthorize(network.id, attemptRef.current)
      setTargets(available)
      setStep('choose')
    } catch (err) {
      setError(getConnectErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // Подтверждение выбранной цели: записываем её в мок-подключение и закрываем модалку
  const runConfirm = async () => {
    const target = targets.find((t) => t.id === targetId)
    if (!target) return
    setLoading(true)
    setError(null)
    try {
      await mockConfirmTarget()
      updateConnection(queryClient, network.id, target.label)
      notifications.show({
        color: 'green',
        message: `Площадка «${network.name}» подключена: ${target.label}`,
      })
      onClose()
    } catch (err) {
      setError(getConnectErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // Отключение площадки в моке и закрытие модалки
  const runDisconnect = async () => {
    setLoading(true)
    setError(null)
    try {
      await mockDisconnect()
      updateConnection(queryClient, network.id, undefined)
      notifications.show({
        color: 'green',
        message: `Площадка «${network.name}» отключена — посты остались в календаре`,
      })
      onClose()
    } catch (err) {
      setError(getConnectErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'disconnect' ? `Отключить ${network.name}?` : `Подключить ${network.name}`

  return (
    <Stack gap={0}>
      <ModalHeader
        network={network}
        title={title}
        onBack={loading ? undefined : onBack}
        onClose={onClose}
      />

      {mode === 'connect' && step === 'intro' && (
        <>
          <Text mt={14} fz={13.5} lh={1.6} c={TEXT_BODY}>
            Отложка получит право публиковать контент от имени вашего сообщества — через официальный
            API площадки.
          </Text>
          <Stack mt={14} gap={8}>
            {CONNECT_STEPS.map((text, index) => (
              <Group key={text} gap={9} wrap="nowrap" align="flex-start">
                <Text fz={12.5} fw={700} c="var(--mantine-color-success-7)">
                  {index + 1}.
                </Text>
                <Text fz={12.5} c={TEXT_STEP}>
                  {text}
                </Text>
              </Group>
            ))}
          </Stack>
          <Button
            fullWidth
            mt={18}
            color={network.color}
            loading={loading}
            styles={ACTION_BUTTON_STYLES}
            onClick={runAuthorize}
          >
            Авторизоваться в «{network.name}»
          </Button>
        </>
      )}

      {mode === 'connect' && step === 'choose' && (
        <>
          <Text mt={14} fz={13.5} lh={1.6} c={TEXT_BODY}>
            Авторизация прошла успешно. Выберите сообщество или канал — Отложка будет публиковать
            посты от его имени.
          </Text>
          <Radio.Group value={targetId ?? ''} onChange={setTargetId} mt={14}>
            <Stack gap={8}>
              {targets.map((target) => (
                <Radio
                  key={target.id}
                  value={target.id}
                  label={target.label}
                  size="sm"
                  color={network.color}
                  disabled={loading}
                />
              ))}
            </Stack>
          </Radio.Group>
          <Button
            fullWidth
            mt={18}
            color={network.color}
            disabled={targetId === null}
            loading={loading}
            styles={ACTION_BUTTON_STYLES}
            onClick={runConfirm}
          >
            Подключить
          </Button>
        </>
      )}

      {mode === 'disconnect' && (
        <>
          <Text mt={14} fz={13.5} lh={1.6} c={TEXT_BODY}>
            Публикации в «{network.name}» остановятся. Запланированные посты останутся в календаре и
            выйдут после повторного подключения.
          </Text>
          <Button
            fullWidth
            mt={18}
            color={DANGER_COLOR}
            loading={loading}
            styles={ACTION_BUTTON_STYLES}
            onClick={runDisconnect}
          >
            Отключить «{network.name}»
          </Button>
        </>
      )}

      {error && (
        <Alert mt={14} color="red" variant="light" radius="md" icon={<IconAlertCircle size={16} />}>
          {error}
        </Alert>
      )}

      <DemoHint />
    </Stack>
  )
}

interface ModalHeaderProps {
  /** Площадка для цветного значка 38×38; без неё — заголовок общего списка */
  network?: Network
  title: string
  onBack?: () => void
  onClose: () => void
}

/** Шапка модалки по макету: значок площадки, заголовок и круглый крестик справа. */
function ModalHeader({ network, title, onBack, onClose }: ModalHeaderProps) {
  return (
    <Group gap={10} wrap="nowrap">
      {onBack && (
        <ActionIcon
          variant="subtle"
          color="gray"
          radius="pill"
          size={30}
          onClick={onBack}
          title="Назад к списку площадок"
          aria-label="Назад к списку площадок"
        >
          <IconArrowLeft size={16} />
        </ActionIcon>
      )}
      {network && (
        <Box
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: network.color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {network.code}
        </Box>
      )}
      <Text fz={17} fw={800} style={{ letterSpacing: -0.2 }}>
        {title}
      </Text>
      <CloseButton ml="auto" radius="pill" size={30} onClick={onClose} aria-label="Закрыть" />
    </Group>
  )
}

/** Подпись-дисклеймер внизу модалки — дословно из макета */
function DemoHint() {
  return (
    <Text ta="center" fz={11.5} c={TEXT_HINT} mt={10}>
      Демо: подключение сработает мгновенно
    </Text>
  )
}

/**
 * Обновляем мок-хранилище подключений (кэш TanStack Query): account задан — площадка
 * подключена к этой цели, undefined — отключена. Чипсы календаря перерисуются сами.
 * TODO (Design First, backlog #118): заменить на POST/DELETE /projects/{id}/connections.
 */
function updateConnection(queryClient: QueryClient, networkId: string, account?: string) {
  queryClient.setQueryData<Connection[]>(connectionKeys.all, (prev) =>
    prev?.map((c) =>
      c.networkId === networkId ? { ...c, connected: account !== undefined, account } : c,
    ),
  )
}
