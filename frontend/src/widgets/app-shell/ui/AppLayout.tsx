import { AppShell, Button, Group, Text } from '@mantine/core'
import { IconBrandTelegram } from '@tabler/icons-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { UserSwitcher } from '@/features/switch-user'

const NAV = [
  { to: '/posts', label: 'Посты' },
  { to: '/platforms', label: 'Платформы' },
]

export function AppLayout() {
  const { pathname } = useLocation()

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <IconBrandTelegram size={22} />
            <Text fw={700}>Hexlet Autoposting</Text>
            <Group gap={4} ml="lg">
              {NAV.map((item) => (
                <Button
                  key={item.to}
                  component={Link}
                  to={item.to}
                  size="sm"
                  variant={pathname.startsWith(item.to) ? 'light' : 'subtle'}
                >
                  {item.label}
                </Button>
              ))}
            </Group>
          </Group>
          <UserSwitcher />
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
