import { Anchor, Box, Container, Divider, Group, SimpleGrid, Stack, Text } from '@mantine/core'
import { Link } from 'react-router-dom'
import { Logo } from '@/shared/ui'

interface FooterLink {
  label: string
  href?: string
  to?: string
}
interface FooterColumn {
  title: string
  links?: FooterLink[]
  lines?: string[]
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'Продукт',
    links: [
      { label: 'Автопостинг', to: '/features/autoposting' },
      { label: 'Кросспостинг', to: '/features/crossposting' },
      { label: 'ИИ-помощник', to: '/features/ai' },
      { label: 'Тарифы', to: '/pricing' },
    ],
  },
  {
    title: 'Площадки',
    lines: ['ВКонтакте · Telegram', 'Одноклассники · MAX', 'Дзен · RUTUBE · YouTube'],
  },
  {
    title: 'Помощь',
    links: [
      { label: 'База знаний', href: '#' },
      { label: 'Поддержка', href: '#' },
      { label: 'Телеграм-канал', href: '#' },
    ],
  },
]

/** Футер маркетинг-сайта: 4 колонки + нижняя строка с копирайтом и правовыми ссылками. */
export function MarketingFooter() {
  return (
    <Box component="footer" bg="white" style={{ borderTop: '1px solid rgba(23,21,15,0.08)' }} py={48}>
      <Container size="lg">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
          <Stack gap="sm">
            <Logo />
            <Text size="sm" c="dimmed" maw={260}>
              Сервис автопостинга и кросспостинга: один контент-план — семь площадок.
            </Text>
          </Stack>
          {COLUMNS.map((col) => (
            <Stack key={col.title} gap="xs">
              <Text fw={700} fz={14}>
                {col.title}
              </Text>
              {col.links?.map((l) =>
                l.to ? (
                  <Anchor key={l.label} component={Link} to={l.to} c="dimmed" fz={14} underline="never">
                    {l.label}
                  </Anchor>
                ) : (
                  <Anchor key={l.label} href={l.href} c="dimmed" fz={14} underline="never">
                    {l.label}
                  </Anchor>
                ),
              )}
              {col.lines?.map((line) => (
                <Text key={line} c="dimmed" fz={14}>
                  {line}
                </Text>
              ))}
            </Stack>
          ))}
        </SimpleGrid>
        <Divider my="lg" />
        <Group justify="space-between" gap="sm" wrap="wrap">
          <Text c="dimmed" fz={13}>
            © Отложка, 2026
          </Text>
          <Group gap="lg" wrap="wrap">
            <Anchor component={Link} to="/legal#oferta" c="dimmed" fz={13} underline="never">
              Оферта
            </Anchor>
            <Anchor component={Link} to="/legal#privacy" c="dimmed" fz={13} underline="never">
              Политика конфиденциальности
            </Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  )
}
