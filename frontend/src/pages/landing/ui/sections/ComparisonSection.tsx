import { Box, Table, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { IconCheck } from '@tabler/icons-react'
import { Section } from '../Section'

const GREEN = '#22A06B'
const HIGHLIGHT_BG = 'rgba(43, 80, 236, 0.05)'

/** Зелёная галочка для колонки «Отложка». */
function UsCheck({ label }: { label?: string }) {
  return (
    <Text component="span" c={GREEN} fw={700} fz="sm" style={{ whiteSpace: 'nowrap' }}>
      <IconCheck size={16} stroke={2.4} style={{ verticalAlign: '-3px' }} />
      {label ? ` ${label}` : ''}
    </Text>
  )
}

/** Значение конкурента: галочка, прочерк или произвольный текст. */
function competitorCell(value: 'yes' | 'no' | string): ReactNode {
  if (value === 'yes') return <IconCheck size={16} stroke={2} />
  if (value === 'no') return '—'
  return value
}

interface CompareRow {
  name: string
  us: ReactNode
  smmplanner: 'yes' | 'no' | string
  planermax: 'yes' | 'no' | string
  livedune: 'yes' | 'no' | string
}

const ROWS: CompareRow[] = [
  {
    name: 'Цена от',
    us: (
      <Text component="span" c="brand.6" fw={700} fz="sm">
        0 ₽
      </Text>
    ),
    smmplanner: 'от ~450 ₽/мес',
    planermax: 'от ~420 ₽/мес',
    livedune: 'от ~800 ₽/мес',
  },
  {
    name: 'Бесплатный тариф',
    us: (
      <Text component="span" c="brand.6" fw={700} fz="sm">
        Навсегда
      </Text>
    ),
    smmplanner: 'Демо-период',
    planermax: 'Демо-период',
    livedune: 'Демо-период',
  },
  {
    name: 'ВК, Telegram, ОК, Дзен',
    us: <UsCheck />,
    smmplanner: 'yes',
    planermax: 'yes',
    livedune: 'yes',
  },
  {
    name: 'Мессенджер MAX',
    us: <UsCheck />,
    smmplanner: 'no',
    planermax: 'yes',
    livedune: 'no',
  },
  {
    name: 'ИИ-генерация текстов',
    us: <UsCheck />,
    smmplanner: 'yes',
    planermax: 'no',
    livedune: 'no',
  },
  {
    name: 'Адаптация поста под площадку',
    us: <UsCheck />,
    smmplanner: 'Частично',
    planermax: 'Частично',
    livedune: 'no',
  },
  {
    name: 'Согласование с клиентом',
    us: <UsCheck label="(Про+)" />,
    smmplanner: 'yes',
    planermax: 'no',
    livedune: 'yes',
  },
]

const COMPETITORS = ['SMMplanner', 'PlanerMax', 'LiveDune'] as const

export function ComparisonSection() {
  return (
    <Section
      id="comparison"
      eyebrow="Сравнение"
      title="Честно про конкурентов"
      subtitle="Мы за осознанный выбор — сравнивайте и решайте сами."
    >
      <Box
        mt="md"
        style={{
          border: '1px solid rgba(23, 21, 15, 0.12)',
          borderRadius: 16,
          overflowX: 'auto',
        }}
      >
        <Table
          miw={640}
          verticalSpacing="sm"
          horizontalSpacing="lg"
          withRowBorders
          style={{ tableLayout: 'fixed' }}
        >
          <Table.Thead>
            <Table.Tr bg="#F6F4EF">
              <Table.Th style={{ width: '30%', color: 'rgba(23, 21, 15, 0.55)', fontWeight: 600 }}>
                Возможность
              </Table.Th>
              <Table.Th
                style={{
                  textAlign: 'center',
                  color: 'var(--mantine-color-brand-6)',
                  fontWeight: 800,
                  background: 'rgba(43, 80, 236, 0.07)',
                }}
              >
                Отложка
              </Table.Th>
              {COMPETITORS.map((name) => (
                <Table.Th key={name} style={{ textAlign: 'center', fontWeight: 600 }}>
                  {name}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {ROWS.map((row) => (
              <Table.Tr key={row.name}>
                <Table.Td fw={600}>{row.name}</Table.Td>
                <Table.Td style={{ textAlign: 'center', background: HIGHLIGHT_BG }}>
                  {row.us}
                </Table.Td>
                <Table.Td style={{ textAlign: 'center', color: 'rgba(23, 21, 15, 0.6)' }}>
                  {competitorCell(row.smmplanner)}
                </Table.Td>
                <Table.Td style={{ textAlign: 'center', color: 'rgba(23, 21, 15, 0.6)' }}>
                  {competitorCell(row.planermax)}
                </Table.Td>
                <Table.Td style={{ textAlign: 'center', color: 'rgba(23, 21, 15, 0.6)' }}>
                  {competitorCell(row.livedune)}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
      <Text fz={12} c="dimmed">
        * По открытым данным сайтов сервисов, июль 2026. Проверяйте актуальные условия перед
        выбором.
      </Text>
    </Section>
  )
}
