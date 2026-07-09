import { Group, Skeleton, Text, UnstyledButton } from '@mantine/core'
import { NETWORKS } from '@/shared/config'
import type { Network } from '@/shared/config'
import { NetworkPill } from '@/shared/ui'
import { useAppModals } from '@/features/app-modals'
import { useConnections } from '@/entities/platform-account'

// Приглушённые тона неподключённой площадки — из макета app-dashboard (блок netChips)
const MUTED_BADGE = 'rgba(23,21,15,.35)'
const MUTED_TEXT = 'rgba(23,21,15,.5)'
const BORDER_CONNECTED = 'rgba(23,21,15,.12)'
const BORDER_DISCONNECTED = 'rgba(23,21,15,.25)'

/**
 * Ряд из 7 чипсов-площадок над календарём: показывает статус подключения,
 * по клику открывает модалку подключения кликнутой площадки.
 */
export function PlatformChips() {
  const { data: connections, isLoading, isError } = useConnections()
  const { openConnectPlatform } = useAppModals()

  // Скелетоны на время «загрузки» подключений (мок отдаёт мгновенно, но форма готова к API)
  if (isLoading) {
    return (
      <Group gap="xs" wrap="wrap">
        {NETWORKS.map((network) => (
          <Skeleton key={network.id} height={36} width={140} radius="var(--mantine-radius-pill)" />
        ))}
      </Group>
    )
  }

  if (isError) {
    return (
      <Text size="sm" c="red">
        Не удалось загрузить статусы площадок — обновите страницу
      </Text>
    )
  }

  const connectedById = new Map(connections.map((c) => [c.networkId, c.connected]))

  return (
    <Group gap="xs" wrap="wrap">
      {NETWORKS.map((network) => (
        <PlatformChip
          key={network.id}
          network={network}
          connected={connectedById.get(network.id) ?? false}
          onOpen={() => openConnectPlatform(network.id)}
        />
      ))}
    </Group>
  )
}

interface PlatformChipProps {
  network: Network
  connected: boolean
  onOpen: () => void
}

/**
 * Чипс площадки — единая кнопка (бейдж + подпись), по клику открывает модалку
 * подключения/отключения. Форма и подписи — из макета app-dashboard (netChips).
 */
function PlatformChip({ network, connected, onOpen }: PlatformChipProps) {
  return (
    <UnstyledButton
      onClick={onOpen}
      title={connected ? 'Нажмите, чтобы отключить' : 'Нажмите, чтобы подключить'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        border: connected
          ? `1.5px solid ${BORDER_CONNECTED}`
          : `1.5px dashed ${BORDER_DISCONNECTED}`,
        borderRadius: 'var(--mantine-radius-pill)',
        background: connected ? 'var(--mantine-color-white)' : 'transparent',
        padding: '6px 12px 6px 7px',
        fontSize: 12.5,
        fontWeight: 600,
        color: connected ? 'var(--mantine-color-text)' : MUTED_TEXT,
      }}
    >
      {/* Серый бейдж неподключённой площадки — подменяем цвет сети на приглушённый */}
      <NetworkPill
        network={connected ? network : { ...network, color: MUTED_BADGE }}
        variant="badge"
        size="chipSm"
      />
      {connected ? network.name : `${network.name} — подключить`}
    </UnstyledButton>
  )
}
