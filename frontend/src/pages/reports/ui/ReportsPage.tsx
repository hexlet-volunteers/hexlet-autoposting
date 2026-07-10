import { usePageMeta } from '@/shared/lib'
import { useState } from 'react'
import {
  Box,
  Button,
  Group,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import { NETWORKS } from '@/shared/config'
import type { Network } from '@/shared/config'
import { EmptyState, NetworkPill, QueryState } from '@/shared/ui'
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
  { value: '2024', label: '2024' },
]

/** Название периода для шапки карточки (repLabel из макета). */
const PERIOD_LABELS: Record<string, string> = {
  week: 'Неделя',
  month: 'Месяц',
  quarter: 'Квартал',
  year: 'Год',
}

/** Форматирование чисел с пробелом-разделителем разрядов (как fmtNum в макете). */
function formatNumber(value: number): string {
  return value.toLocaleString('ru-RU')
}

function findNetwork(networkId: string): Network | undefined {
  return NETWORKS.find((n) => n.id === networkId)
}

export function ReportsPage() {
  usePageMeta({
    title: 'Отчёты — Отложка',
    description: 'Аналитика публикаций по площадкам в Отложке.',
    noindex: true,
  })
  const [period, setPeriod] = useState<string>('week')
  const [year, setYear] = useState<string>('2026')

  const { data, isLoading, error } = useReport(period, year)

  const totals = data.reduce(
    (acc, row) => ({
      publications: acc.publications + row.publications,
      views: acc.views + row.views,
      clicks: acc.clicks + row.clicks,
    }),
    { publications: 0, views: 0, clicks: 0 } satisfies Omit<ReportRow, 'networkId'>,
  )

  // Максимум просмотров — база для длины прогресс-бара «Просмотры» (как r.bar в макете).
  const maxViews = data.reduce((max, row) => Math.max(max, row.views), 0)

  const handleDownload = () => {
    // TODO (Design First): заменить на GET /projects/{id}/reports/export?period=&year=
    // (эндпоинт появится в бэкенде). Пока собираем CSV из текущих мок-данных таблицы.
    const header = ['Площадка', 'Публикации', 'Просмотры', 'Переходы']
    const rows = data.map((row) => [
      findNetwork(row.networkId)?.name ?? row.networkId,
      row.publications,
      row.views,
      row.clicks,
    ])
    const totalsRow = ['Итого', totals.publications, totals.views, totals.clicks]
    const csv = [header, ...rows, totalsRow].map((cells) => cells.join(';')).join('\n')

    // BOM в начале — чтобы Excel корректно распознал кириллицу в UTF-8.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report-${period}-${year}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <Title order={2}>Отчёты</Title>
        <Button
          variant="default"
          leftSection={<IconDownload size={16} />}
          onClick={handleDownload}
          disabled={isLoading || Boolean(error) || data.length === 0}
        >
          Скачать отчёт
        </Button>
      </Group>

      <Group gap="sm" wrap="wrap">
        <SegmentedControl
          data={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
          radius="md"
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

      <QueryState isLoading={isLoading} error={error}>
        {data.length === 0 ? (
          <EmptyState
            title="Пока нет данных для отчёта"
            description="Подключите площадки и опубликуйте посты — статистика появится здесь."
          />
        ) : (
          <Paper withBorder radius="lg" style={{ overflow: 'hidden' }}>
            <Group
              gap="sm"
              px="lg"
              py="sm"
              style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
            >
              <Text fw={700} fz={14.5}>
                {PERIOD_LABELS[period]} · {year}
              </Text>
              <Text ml="auto" fz={12} c="dimmed">
                демо-данные
              </Text>
            </Group>
            <Box style={{ overflowX: 'auto' }}>
              <Table miw={640} verticalSpacing="sm" horizontalSpacing="lg" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '30%' }}>Площадка</Table.Th>
                    <Table.Th style={{ width: '15%' }}>Публикации</Table.Th>
                    <Table.Th style={{ width: '40%' }}>Просмотры</Table.Th>
                    <Table.Th ta="right" style={{ width: '15%' }}>
                      Переходы
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.map((row) => {
                    const network = findNetwork(row.networkId)
                    const barColor = network?.color ?? 'var(--mantine-color-gray-5)'
                    const barWidth = maxViews > 0 ? `${(row.views / maxViews) * 100}%` : '0%'
                    return (
                      <Table.Tr key={row.networkId}>
                        <Table.Td>
                          {network ? (
                            <Group gap={9} wrap="nowrap">
                              <NetworkPill network={network} variant="badge" />
                              <Text size="sm" fw={600}>
                                {network.name}
                              </Text>
                            </Group>
                          ) : (
                            <Text size="sm">{row.networkId}</Text>
                          )}
                        </Table.Td>
                        <Table.Td>{formatNumber(row.publications)}</Table.Td>
                        <Table.Td>
                          <Group gap={10} wrap="nowrap">
                            <Text size="sm" fw={600} style={{ minWidth: 64 }}>
                              {formatNumber(row.views)}
                            </Text>
                            <Box
                              style={{
                                flex: 1,
                                height: 7,
                                borderRadius: 'var(--mantine-radius-pill)',
                                background: 'rgba(23,21,15,.07)',
                              }}
                            >
                              <Box
                                style={{
                                  width: barWidth,
                                  height: 7,
                                  borderRadius: 'var(--mantine-radius-pill)',
                                  background: barColor,
                                }}
                              />
                            </Box>
                          </Group>
                        </Table.Td>
                        <Table.Td ta="right">{formatNumber(row.clicks)}</Table.Td>
                      </Table.Tr>
                    )
                  })}
                </Table.Tbody>
                <Table.Tfoot>
                  <Table.Tr>
                    <Table.Th>Итого</Table.Th>
                    <Table.Th>{formatNumber(totals.publications)}</Table.Th>
                    <Table.Th>{formatNumber(totals.views)}</Table.Th>
                    <Table.Th ta="right">{formatNumber(totals.clicks)}</Table.Th>
                  </Table.Tr>
                </Table.Tfoot>
              </Table>
            </Box>
          </Paper>
        )}
      </QueryState>

      <Text size="sm" c="dimmed">
        Отчёт уходит в Telegram каждое воскресенье в 20:00 — настроить можно в разделе «Настройки».
      </Text>
    </Stack>
  )
}
