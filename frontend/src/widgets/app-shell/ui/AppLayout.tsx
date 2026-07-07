import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Button,
  Group,
  Menu,
  NavLink,
  Progress,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconCalendar,
  IconChartBar,
  IconChevronDown,
  IconClockHour4,
  IconLogout,
  IconPhoto,
  IconPlus,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/shared/ui'
import { useCurrentProject, useProjects, setCurrentProject } from '@/entities/project'
import { logout } from '@/entities/session'
import { useDispatch } from 'react-redux'
import { CreateProjectModal } from '@/features/create-project'
import { useAppModals } from '@/features/app-modals'
import { AppModals } from './AppModals'

const NAV = [
  { label: 'Календарь', to: '/app/calendar', icon: IconCalendar },
  { label: 'Очередь', to: '/app/queue', icon: IconClockHour4 },
  { label: 'Медиатека', to: '/app/media', icon: IconPhoto },
  { label: 'Отчёты', to: '/app/reports', icon: IconChartBar },
  { label: 'Команда', to: '/app/team', icon: IconUsers },
  { label: 'Настройки', to: '/app/settings', icon: IconSettings },
]

function ProjectSwitcher({ onNewProject }: { onNewProject: () => void }) {
  const dispatch = useDispatch()
  const { data: projects = [] } = useProjects()
  const current = useCurrentProject()
  const active = projects.filter((p) => !p.archived)
  const archived = projects.filter((p) => p.archived)

  const dot = (color: string, letter: string) => (
    <Box
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        background: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      {letter}
    </Box>
  )

  return (
    <Menu width={232} position="bottom-start" shadow="md">
      <Menu.Target>
        <UnstyledButton
          style={{
            width: '100%',
            padding: 8,
            borderRadius: 10,
            border: '1px solid rgba(23,21,15,0.1)',
          }}
        >
          <Group gap={8} wrap="nowrap">
            {current ? dot(current.color, current.letter) : null}
            <Text fw={600} fz={14} lineClamp={1} style={{ flex: 1 }}>
              {current?.name ?? 'Проект'}
            </Text>
            <IconChevronDown size={16} />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Проекты</Menu.Label>
        {active.map((p) => (
          <Menu.Item
            key={p.id}
            leftSection={dot(p.color, p.letter)}
            onClick={() => dispatch(setCurrentProject(p.id))}
          >
            {p.name}
          </Menu.Item>
        ))}
        <Menu.Item leftSection={<IconPlus size={18} />} onClick={onNewProject}>
          Новый проект
        </Menu.Item>
        {archived.length > 0 && (
          <>
            <Menu.Divider />
            <Menu.Label>Архив</Menu.Label>
            {archived.map((p) => (
              <Menu.Item key={p.id} leftSection={dot(p.color, p.letter)} disabled>
                {p.name}
              </Menu.Item>
            ))}
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}

function PlanWidget() {
  const { openUpgrade } = useAppModals()
  return (
    <Box
      p="sm"
      style={{
        borderRadius: 12,
        background: 'rgba(43,80,236,0.06)',
        border: '1px solid rgba(43,80,236,0.12)',
      }}
    >
      <Group justify="space-between" mb={4}>
        <Text fw={700} fz={13}>
          Бесплатный
        </Text>
        <Text fz={11} c="dimmed">
          до 12 дек
        </Text>
      </Group>
      <Text fz={11} c="dimmed" mb={4}>
        ИИ-тексты: 5 / 50
      </Text>
      <Progress value={10} size="sm" color="brand" mb="sm" />
      <Button size="xs" variant="light" fullWidth onClick={openUpgrade}>
        Улучшить тариф
      </Button>
    </Box>
  )
}

/** Оболочка приложения: Mantine AppShell с левым сайдбаром. */
export function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [newProjectOpened, newProject] = useDisclosure(false)

  const handleLogout = () => {
    // Мок-сессия: сбрасываем признак входа, чтобы /app/* снова требовал входа.
    dispatch(logout())
    navigate('/')
  }

  return (
    <AppShell navbar={{ width: 264, breakpoint: 'sm' }} padding="md">
      <AppShell.Navbar p="sm" bg="white">
        <AppShell.Section>
          <Box px={6} py={4}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Logo />
            </Link>
          </Box>
        </AppShell.Section>

        <AppShell.Section mt="sm">
          <ProjectSwitcher onNewProject={newProject.open} />
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea} mt="md">
          <Stack gap={2}>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                component={Link}
                to={item.to}
                label={item.label}
                leftSection={<item.icon size={18} stroke={1.8} />}
                active={pathname.startsWith(item.to)}
                variant="light"
              />
            ))}
          </Stack>
        </AppShell.Section>

        <AppShell.Section mt="md">
          <Stack gap="sm">
            <PlanWidget />
            <Group justify="space-between" wrap="nowrap" px={4}>
              <Group gap={8} wrap="nowrap">
                <Avatar color="brand" radius="xl" size={30}>
                  М
                </Avatar>
                <Text fw={600} fz={13} lineClamp={1}>
                  Мария
                </Text>
              </Group>
              <Tooltip label="Выйти">
                <ActionIcon variant="subtle" color="gray" onClick={handleLogout} aria-label="Выйти">
                  <IconLogout size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <CreateProjectModal opened={newProjectOpened} onClose={newProject.close} />
      <AppModals />
    </AppShell>
  )
}
