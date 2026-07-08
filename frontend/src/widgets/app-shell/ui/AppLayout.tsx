import {
  Anchor,
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
  UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconCalendar,
  IconChartBar,
  IconCheck,
  IconChevronDown,
  IconClockHour4,
  IconPhoto,
  IconPlus,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { Logo } from '@/shared/ui'
import { useCurrentProject, useProjects, setCurrentProject } from '@/entities/project'
import { useSubscription, useQuota } from '@/entities/subscription'
import { mediaKeys } from '@/entities/media'
import { scheduledPostKeys } from '@/entities/scheduled-post'
import { logout } from '@/entities/session'
import { useDispatch } from 'react-redux'
import { CreateProjectModal, useRestoreProject } from '@/features/create-project'
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
  const queryClient = useQueryClient()
  const restoreProject = useRestoreProject()
  const { data: projects = [] } = useProjects()
  const current = useCurrentProject()
  const active = projects.filter((p) => !p.archived)
  const archived = projects.filter((p) => p.archived)
  // Порядковый номер текущего проекта среди активных — для подписи «проект N из M»
  const activeIndex = current ? active.findIndex((p) => p.id === current.id) : -1

  const selectProject = (id: string) => {
    dispatch(setCurrentProject(id))
    // Разделы перечитывают мок-данные под новый проект
    // (ключи с projectId появятся вместе с реальным API — см. #147)
    queryClient.invalidateQueries({ queryKey: scheduledPostKeys.all })
    queryClient.invalidateQueries({ queryKey: mediaKeys.all })
  }

  const dot = (color: string, letter: string, muted = false) => (
    <Box
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        background: muted ? 'rgba(23,21,15,0.12)' : color,
        color: muted ? 'rgba(23,21,15,0.5)' : '#fff',
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
    <Menu width="target" position="bottom-start" shadow="md">
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
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text fw={600} fz={14} lineClamp={1}>
                {current?.name ?? 'Проект'}
              </Text>
              {activeIndex >= 0 && (
                <Text fz={11} c="dimmed">
                  проект {activeIndex + 1} из {active.length}
                </Text>
              )}
            </Box>
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
            rightSection={
              p.id === current?.id ? (
                <IconCheck size={16} color="var(--mantine-color-brand-6)" stroke={2.5} />
              ) : undefined
            }
            onClick={() => selectProject(p.id)}
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
              <Group key={p.id} gap={8} wrap="nowrap" px={10} py={6}>
                {dot(p.color, p.letter, true)}
                <Text fz={13} fw={600} c="dimmed" lineClamp={1} style={{ flex: 1 }}>
                  {p.name}
                </Text>
                <Anchor
                  component="button"
                  type="button"
                  fz={11.5}
                  fw={700}
                  onClick={() => restoreProject(p.id)}
                >
                  Вернуть
                </Anchor>
              </Group>
            ))}
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}

function PlanWidget() {
  const { openUpgrade } = useAppModals()
  const { data: subscription } = useSubscription()
  const { used, limit, exhausted } = useQuota('ai')

  // Безлимитный тариф: показываем «безлимит» без счётчика и прогресс-бара
  const unlimited = !Number.isFinite(limit)
  const percent = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  // Подсветка: с ~80% — предупреждение, при исчерпании — цвет ошибки
  const nearLimit = !unlimited && !exhausted && percent >= 80
  const quotaColor = exhausted ? 'red' : nearLimit ? 'orange' : 'brand'
  // На «Старте» предлагаем улучшение, на остальных тарифах — смену
  const upgradeLabel = subscription.plan === 'Старт' ? 'Улучшить тариф' : 'Сменить тариф'
  const renewsLabel = `до ${dayjs(subscription.renewsAt).locale('ru').format('D MMM').replace('.', '')}`

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
          {subscription.plan}
        </Text>
        <Text fz={11} c="dimmed">
          {renewsLabel}
        </Text>
      </Group>
      {unlimited ? (
        <Text fz={11} c="dimmed" mb="xs">
          ИИ-тексты: безлимит
        </Text>
      ) : (
        <>
          <Text fz={11} c={exhausted ? 'red.7' : nearLimit ? 'orange.8' : 'dimmed'} mb={4}>
            ИИ-тексты: {used} / {limit}
          </Text>
          <Progress value={percent} size="sm" color={quotaColor} mb="sm" />
          {exhausted && (
            <Text fz={11} c="red.7" mb="xs">
              Лимит на период исчерпан — поднимите его апгрейдом тарифа
            </Text>
          )}
        </>
      )}
      <Button
        size="xs"
        variant={exhausted || nearLimit ? 'filled' : 'light'}
        fullWidth
        onClick={openUpgrade}
      >
        {upgradeLabel} →
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
    <AppShell navbar={{ width: 236, breakpoint: 'sm' }} padding="md">
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
            <Group gap={8} wrap="nowrap" px={4}>
              <Avatar color="brand" radius="xl" size={30}>
                М
              </Avatar>
              <Box>
                <Text fw={600} fz={13} lineClamp={1}>
                  Мария
                </Text>
                <Anchor
                  component="button"
                  type="button"
                  fz={11.5}
                  c="dimmed"
                  onClick={handleLogout}
                >
                  Выйти
                </Anchor>
              </Box>
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
