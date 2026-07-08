import {
  Anchor,
  Box,
  Burger,
  Button,
  Container,
  Divider,
  Drawer,
  Group,
  Stack,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Link } from 'react-router-dom'
import { Logo } from '@/shared/ui'
import { useAuthModal } from '@/features/auth'

/** Идентификатор пункта меню, который страница может подсветить как активный. */
export type MarketingNavId = 'features' | 'how' | 'networks' | 'pricing' | 'faq'

interface NavItem {
  id: MarketingNavId
  label: string
  /** Путь для react-router: якорные пункты ведут на главную (/#anchor) с любой страницы. */
  to: string
}

const NAV: NavItem[] = [
  { id: 'features', label: 'Возможности', to: '/#features' },
  { id: 'how', label: 'Как это работает', to: '/#how' },
  { id: 'networks', label: 'Соцсети', to: '/#networks' },
  { id: 'pricing', label: 'Тарифы', to: '/pricing' },
  { id: 'faq', label: 'FAQ', to: '/#faq' },
]

/** Цвета пунктов меню из макета: активный — тёмный и жирный, остальные приглушённые. */
const NAV_ACTIVE_COLOR = '#17150F'
const NAV_COLOR = 'rgba(23,21,15,0.65)'

interface MarketingHeaderProps {
  /** Активный пункт меню (подсвечивается тёмным и жирным); без пропа активного пункта нет. */
  active?: MarketingNavId
}

/** Липкая шапка маркетинг-сайта: логотип, навигация (на мобильном — бургер с Drawer), кнопки входа. */
export function MarketingHeader({ active }: MarketingHeaderProps) {
  const { open } = useAuthModal()
  const [menuOpened, { toggle: toggleMenu, close: closeMenu }] = useDisclosure(false)

  // закрыть мобильное меню и открыть модалку входа/регистрации
  const openAuth = (mode: 'login' | 'register') => {
    closeMenu()
    open(mode)
  }

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
              {NAV.map((item) => (
                <Anchor
                  key={item.id}
                  component={Link}
                  to={item.to}
                  underline="never"
                  fw={item.id === active ? 700 : 600}
                  fz={14}
                  c={item.id === active ? NAV_ACTIVE_COLOR : NAV_COLOR}
                >
                  {item.label}
                </Anchor>
              ))}
            </Group>
          </Group>
          <Group gap="sm" wrap="nowrap">
            <Button
              variant="subtle"
              color="dark"
              size="sm"
              visibleFrom="sm"
              onClick={() => open('login')}
            >
              Войти
            </Button>
            <Button size="sm" visibleFrom="xs" onClick={() => open('register')}>
              Попробовать бесплатно
            </Button>
            <Burger
              opened={menuOpened}
              onClick={toggleMenu}
              hiddenFrom="sm"
              size="sm"
              aria-label="Открыть меню"
            />
          </Group>
        </Group>
      </Container>

      {/* Мобильное меню: все пункты навигации + кнопки входа */}
      <Drawer
        opened={menuOpened}
        onClose={closeMenu}
        position="right"
        size="xs"
        hiddenFrom="sm"
        title={<Logo />}
      >
        <Stack gap="xs">
          {NAV.map((item) => (
            <Anchor
              key={item.id}
              component={Link}
              to={item.to}
              underline="never"
              fw={item.id === active ? 700 : 600}
              fz={16}
              py={6}
              c={item.id === active ? NAV_ACTIVE_COLOR : NAV_COLOR}
              onClick={closeMenu}
            >
              {item.label}
            </Anchor>
          ))}
          <Divider my="xs" />
          <Button variant="default" color="dark" onClick={() => openAuth('login')}>
            Войти
          </Button>
          <Button onClick={() => openAuth('register')}>Попробовать бесплатно</Button>
        </Stack>
      </Drawer>
    </Box>
  )
}
