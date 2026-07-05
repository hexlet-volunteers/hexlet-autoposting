import { Anchor, Box, Button, Container, Group } from '@mantine/core'
import { Link } from 'react-router-dom'
import { Logo } from '@/shared/ui'
import { useAuthModal } from '@/features/auth'

interface NavItem {
  label: string
  href?: string
  to?: string
}

const NAV: NavItem[] = [
  { label: 'Возможности', href: '#features' },
  { label: 'Как это работает', href: '#how' },
  { label: 'Соцсети', href: '#networks' },
  { label: 'Тарифы', to: '/pricing' },
  { label: 'FAQ', href: '#faq' },
]

/** Липкая шапка маркетинг-сайта: логотип, якорная навигация, кнопки входа. */
export function MarketingHeader() {
  const { open } = useAuthModal()
  return (
    <Box
      component="header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(246,244,239,0.93)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(23,21,15,0.08)',
      }}
    >
      <Container size="lg">
        <Group h={64} justify="space-between" wrap="nowrap">
          <Group gap="xl" wrap="nowrap">
            <Anchor component={Link} to="/" underline="never" c="inherit">
              <Logo />
            </Anchor>
            <Group gap="lg" visibleFrom="sm">
              {NAV.map((item) =>
                item.to ? (
                  <Anchor
                    key={item.label}
                    component={Link}
                    to={item.to}
                    underline="never"
                    fw={600}
                    fz={14}
                    c="rgba(23,21,15,0.65)"
                  >
                    {item.label}
                  </Anchor>
                ) : (
                  <Anchor
                    key={item.label}
                    href={item.href}
                    underline="never"
                    fw={600}
                    fz={14}
                    c="rgba(23,21,15,0.65)"
                  >
                    {item.label}
                  </Anchor>
                ),
              )}
            </Group>
          </Group>
          <Group gap="sm" wrap="nowrap">
            <Button variant="subtle" color="dark" size="sm" visibleFrom="xs" onClick={() => open('login')}>
              Войти
            </Button>
            <Button size="sm" onClick={() => open('register')}>
              Попробовать бесплатно
            </Button>
          </Group>
        </Group>
      </Container>
    </Box>
  )
}
