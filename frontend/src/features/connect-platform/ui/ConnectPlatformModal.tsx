import { useEffect, useState } from 'react'
import { Button, Divider, Group, Modal, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { NETWORKS } from '@/shared/config/networks'
import { ConfirmDeleteButton, NetworkPill } from '@/shared/ui'
import { useConnections } from '@/entities/platform-account'
import type { Connection } from '@/entities/platform-account'
import { useAppModals } from '@/features/app-modals'

/**
 * Глобальная модалка подключения площадок. Состояние открытия читается из
 * useAppModals(); список подключений держим в ЛОКАЛЬНОМ стейте, засеянном
 * из useConnections(). Все мутации — заглушки (демо, OAuth сработает мгновенно).
 */
export function ConnectPlatformModal() {
  const { connectPlatform, closeConnectPlatform } = useAppModals()
  const { data } = useConnections()

  const [connections, setConnections] = useState<Connection[]>(data)

  // Пересинхронизируемся с исходными данными при каждом открытии модалки.
  useEffect(() => {
    if (connectPlatform.opened) setConnections(data)
  }, [connectPlatform.opened, data])

  const byId = new Map(connections.map((c) => [c.networkId, c]))

  const connect = (networkId: string, name: string) => {
    // TODO (Design First, backlog #118): POST /projects/{id}/connections (OAuth redirect).
    setConnections((prev) =>
      prev.map((c) =>
        c.networkId === networkId ? { ...c, connected: true, account: `Аккаунт «${name}»` } : c,
      ),
    )
    notifications.show({ color: 'green', message: `Площадка «${name}» подключена — OAuth (демо)` })
  }

  const disconnect = (networkId: string, name: string) => {
    // TODO (Design First, backlog #118): DELETE /projects/{id}/connections/{networkId}.
    setConnections((prev) =>
      prev.map((c) =>
        c.networkId === networkId ? { ...c, connected: false, account: undefined } : c,
      ),
    )
    notifications.show({ color: 'green', message: `Площадка «${name}» отключена (демо)` })
  }

  return (
    <Modal
      opened={connectPlatform.opened}
      onClose={closeConnectPlatform}
      centered
      radius="lg"
      size="md"
      title="Подключение площадок"
    >
      <Stack gap={0}>
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

                {connected ? (
                  <ConfirmDeleteButton
                    onConfirm={() => disconnect(network.id, network.name)}
                    tooltip="Отключить"
                    confirmText={`Отключить «${network.name}»? Публикации остановятся. Запланированные посты останутся в календаре и выйдут после повторного подключения.`}
                  />
                ) : (
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() => connect(network.id, network.name)}
                  >
                    Подключить
                  </Button>
                )}
              </Group>
            </div>
          )
        })}

        <Text ta="center" size="xs" c="dimmed" mt="lg">
          Демо: подключение сработает мгновенно
        </Text>
      </Stack>
    </Modal>
  )
}
