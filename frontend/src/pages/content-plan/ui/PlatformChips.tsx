import { Box, Group, Skeleton, Text, UnstyledButton } from '@mantine/core'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { NETWORKS } from '@/shared/config'
import type { Network } from '@/shared/config'
import { NetworkPill } from '@/shared/ui'
import { useAppModals } from '@/features/app-modals'
import { useCalendarFilter } from '@/features/filter-by-platform'
import { useConnections } from '@/entities/platform-account'

// Приглушённые тона неподключённой площадки — из макета app-dashboard (блок netChips)
const MUTED_BADGE = 'rgba(23,21,15,.35)'
const MUTED_TEXT = 'rgba(23,21,15,.5)'
const BORDER_CONNECTED = 'rgba(23,21,15,.12)'
const BORDER_DISCONNECTED = 'rgba(23,21,15,.25)'

/**
 * Ряд из 7 чипсов-площадок над календарём: показывает статус подключения,
 * по клику открывает модалку «Подключение площадок», а иконка-глаз в чипсе
 * включает/выключает площадку в фильтре постов календаря.
 */
export function PlatformChips() {
  const { data: connections, isLoading, isError } = useConnections()
  const { openConnectPlatform } = useAppModals()
  const { isNetworkActive, toggleNetwork } = useCalendarFilter()

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
          filterActive={isNetworkActive(network.id)}
          onOpen={() => openConnectPlatform()}
          onToggleFilter={() => toggleNetwork(network.id)}
        />
      ))}
    </Group>
  )
}

interface PlatformChipProps {
  network: Network
  connected: boolean
  filterActive: boolean
  onOpen: () => void
  onToggleFilter: () => void
}

/**
 * Чипс площадки. Основная кнопка (бейдж + подпись) открывает модалку подключения,
 * отдельная иконка-глаз переключает фильтр — клики не конфликтуют (кнопки не вложены).
 */
function PlatformChip({
  network,
  connected,
  filterActive,
  onOpen,
  onToggleFilter,
}: PlatformChipProps) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        border: connected
          ? `1.5px solid ${BORDER_CONNECTED}`
          : `1.5px dashed ${BORDER_DISCONNECTED}`,
        borderRadius: 'var(--mantine-radius-pill)',
        background: connected ? 'var(--mantine-color-white)' : 'transparent',
        paddingRight: 6,
      }}
    >
      <UnstyledButton
        onClick={onOpen}
        title={connected ? 'Нажмите, чтобы отключить' : 'Нажмите, чтобы подключить'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '5px 5px 5px 6px',
          fontSize: 12.5,
          fontWeight: 600,
          color: connected ? 'var(--mantine-color-text)' : MUTED_TEXT,
        }}
      >
        {/* Серый бейдж неподключённой площадки — подменяем цвет сети на приглушённый */}
        <NetworkPill
          network={connected ? network : { ...network, color: MUTED_BADGE }}
          variant="badge"
        />
        {connected ? network.name : `${network.name} — подключить`}
      </UnstyledButton>
      <UnstyledButton
        onClick={onToggleFilter}
        title={
          filterActive ? 'Скрыть посты площадки в календаре' : 'Показать посты площадки в календаре'
        }
        aria-pressed={filterActive}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: 3,
          color: filterActive ? 'var(--mantine-color-brand-6)' : MUTED_BADGE,
        }}
      >
        {filterActive ? <IconEye size={16} /> : <IconEyeOff size={16} />}
      </UnstyledButton>
    </Box>
  )
}
