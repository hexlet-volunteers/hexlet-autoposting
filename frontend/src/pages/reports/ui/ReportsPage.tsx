import { useState } from 'react'
import { Box, Button, Group, Select, Stack, Table, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconDownload } from '@tabler/icons-react'
import { NETWORKS } from '@/shared/config/networks'
import type { Network } from '@/shared/config/networks'
import { EmptyState, NetworkPill } from '@/shared/ui'
import { useReport } from '@/entities/report'
import type { ReportRow } from '@/entities/report'

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'year', label: 'Год' },
]

const YEAR_OPTIONS = [
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
]

/** Форматирование чисел с пробелом-разделителем разрядов (как fmtNum в макете). */
function formatNumber(value: number): string {
  return value.toLocaleString('ru-RU')
}

function findNetwork(networkId: string): Network | undefined {
  return NETWORKS.find((n) => n.id === networkId)
}

export function ReportsPage() {
  const [period, setPeriod] = useState<string>('week')
  const [year, setYear] = useState<string>('2026')

  const { data } = useReport(period, year)

  const handleDownload = () => {
    // TODO (Design First): GET /projects/{id}/reports/export?period=&year= (эндпоинт появится в бэкенде).
    notifications.show({ color: 'green', message: 'Отчёт готовится к скачиванию (демо)' })
  }

  const totals = data.reduce(
    (acc, row) => ({
      publications: acc.publications + row.publications,
      views: acc.views + row.views,
      likes: acc.likes + row.likes,
      reposts: acc.reposts + row.reposts,
    }),
    { publications: 0, views: 0, likes: 0, reposts: 0 } satisfies Omit<ReportRow, 'networkId'>,
  )

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <Title order={2}>Отчёты</Title>
        <Button
          variant="default"
          leftSection={<IconDownload size={16} />}
          onClick={handleDownload}
        >
          Скачать отчёт
        </Button>
      </Group>

      <Group gap="sm" wrap="wrap">
        <Select
          data={PERIOD_OPTIONS}
          value={period}
          onChange={(value) => value && setPeriod(value)}
          allowDeselect={false}
          w={160}
          aria-label="Период"
        />
        <Select
          data={YEAR_OPTIONS}
          value={year}
          onChange={(value) => value && setYear(value)}
          allowDeselect={false}
          w={120}
          aria-label="Год"
        />
      </Group>

      {data.length === 0 ? (
        <EmptyState
          title="Пока нет данных для отчёта"
          description="Подключите площадки и опубликуйте посты — статистика появится здесь."
        />
      ) : (
        <Box style={{ overflowX: 'auto' }}>
          <Table miw={640} verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Площадка</Table.Th>
                <Table.Th ta="right">Публикации</Table.Th>
                <Table.Th ta="right">Просмотры</Table.Th>
                <Table.Th ta="right">Лайки</Table.Th>
                <Table.Th ta="right">Репосты</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((row) => {
                const network = findNetwork(row.networkId)
                return (
                  <Table.Tr key={row.networkId}>
                    <Table.Td>
                      {network ? (
                        <NetworkPill network={network} />
                      ) : (
                        <Text size="sm">{row.networkId}</Text>
                      )}
                    </Table.Td>
                    <Table.Td ta="right">{formatNumber(row.publications)}</Table.Td>
                    <Table.Td ta="right">{formatNumber(row.views)}</Table.Td>
                    <Table.Td ta="right">{formatNumber(row.likes)}</Table.Td>
                    <Table.Td ta="right">{formatNumber(row.reposts)}</Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Th>Итого</Table.Th>
                <Table.Th ta="right">{formatNumber(totals.publications)}</Table.Th>
                <Table.Th ta="right">{formatNumber(totals.views)}</Table.Th>
                <Table.Th ta="right">{formatNumber(totals.likes)}</Table.Th>
                <Table.Th ta="right">{formatNumber(totals.reposts)}</Table.Th>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Box>
      )}

      <Text size="sm" c="dimmed">
        Отчёт уходит в Telegram каждое воскресенье в 20:00 — настроить можно в разделе
        «Настройки».
      </Text>
    </Stack>
  )
}
