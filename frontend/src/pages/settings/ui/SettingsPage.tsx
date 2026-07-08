import { useState } from 'react'
import {
  Button,
  ColorSwatch,
  Group,
  Paper,
  Popover,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconArchive } from '@tabler/icons-react'
import { PROJECT_COLORS } from '@/shared/config'
import { ColorPickerModal } from '@/shared/ui'
import { useCurrentProject } from '@/entities/project'

const TIMEZONES = [
  'Europe/Moscow (UTC+3)',
  'Asia/Yekaterinburg (UTC+5)',
  'Asia/Novosibirsk (UTC+7)',
  'Asia/Vladivostok (UTC+10)',
]

/** Заглушка сохранения — реальный API появится в бэкенде (issue #118). */
function showSavedStub() {
  // TODO (Design First): PATCH профиля/проекта, issue #118. Пока заглушка.
  notifications.show({ color: 'green', message: 'Сохранено (демо)' })
}

export function SettingsPage() {
  const project = useCurrentProject()

  const [projectName, setProjectName] = useState(project?.name ?? '')
  const [projectColor, setProjectColor] = useState(project?.color ?? PROJECT_COLORS[0])
  const [timezone, setTimezone] = useState<string | null>(TIMEZONES[0])
  const [telegramReport, setTelegramReport] = useState(true)
  const [failureEmails, setFailureEmails] = useState(false)
  const [archiveConfirmOpened, archiveConfirm] = useDisclosure(false)
  const [colorModalOpened, colorModal] = useDisclosure(false)

  const handleArchive = () => {
    // TODO (Design First): POST архивации проекта, issue #118. Пока заглушка.
    notifications.show({ color: 'red', message: 'Проект архивирован (демо)' })
    archiveConfirm.close()
  }

  return (
    <Stack maw={720} gap="lg">
      <Title order={2}>Настройки</Title>

      {/* ===== Профиль ===== */}
      <Paper withBorder radius="md" p="lg">
        <Stack gap="md">
          <Title order={4}>Профиль</Title>
          <TextInput label="Имя" defaultValue="Мария" />
          <TextInput label="Почта" type="email" defaultValue="maria@example.ru" />
          <Group>
            <Button onClick={showSavedStub}>Сохранить</Button>
          </Group>
        </Stack>
      </Paper>

      {/* ===== Проект ===== */}
      <Paper withBorder radius="md" p="lg">
        <Stack gap="md">
          <Title order={4}>Проект</Title>
          <TextInput
            label="Название"
            value={projectName}
            onChange={(event) => setProjectName(event.currentTarget.value)}
          />
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Цвет проекта
            </Text>
            {/* Превью выбранного цвета + кнопка, открывающая модалку выбора */}
            <Group gap={10}>
              <ColorSwatch color={projectColor} size={32} />
              <Button variant="default" size="sm" onClick={colorModal.open}>
                Изменить цвет…
              </Button>
            </Group>
          </Stack>
          <Select
            label="Часовой пояс публикаций"
            data={TIMEZONES}
            value={timezone}
            onChange={setTimezone}
            allowDeselect={false}
          />
          <Switch
            label="Отчёт о публикациях в Telegram"
            checked={telegramReport}
            onChange={(event) => setTelegramReport(event.currentTarget.checked)}
          />
          <Switch
            label="Письма о сбоях публикации"
            checked={failureEmails}
            onChange={(event) => setFailureEmails(event.currentTarget.checked)}
          />
          <Group>
            <Button onClick={showSavedStub}>Сохранить</Button>
          </Group>
        </Stack>
      </Paper>

      {/* ===== Архив проекта (danger zone) ===== */}
      <Paper
        withBorder
        radius="md"
        p="lg"
        style={{
          borderColor: 'var(--mantine-color-red-4)',
          backgroundColor: 'var(--mantine-color-red-0)',
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="lg">
          <Stack gap={4} style={{ minWidth: 0 }}>
            <Text fw={700} c="red">
              Архив проекта
            </Text>
            <Text size="sm" c="dimmed">
              Проект скроется из списка, публикации остановятся. Посты и настройки сохранятся —
              вернуть проект можно в любой момент из списка проектов.
            </Text>
          </Stack>
          <Popover
            opened={archiveConfirmOpened}
            onChange={(o) => (o ? archiveConfirm.open() : archiveConfirm.close())}
            withArrow
            position="bottom-end"
          >
            <Popover.Target>
              <Button
                color="red"
                variant="light"
                leftSection={<IconArchive size={16} />}
                onClick={archiveConfirm.open}
                style={{ flex: 'none' }}
              >
                Архивировать проект
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="sm" mb="xs">
                Архивировать проект «{projectName || project?.name}»?
              </Text>
              <Group justify="flex-end" gap="xs">
                <Button size="xs" variant="default" onClick={archiveConfirm.close}>
                  Отмена
                </Button>
                <Button size="xs" color="red" onClick={handleArchive}>
                  Архивировать
                </Button>
              </Group>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Paper>

      {/* Модалка выбора цвета проекта — применяет цвет в локальном состоянии формы */}
      <ColorPickerModal
        opened={colorModalOpened}
        value={projectColor}
        onSelect={setProjectColor}
        onClose={colorModal.close}
      />
    </Stack>
  )
}
