import { useState } from 'react'
import {
  Button,
  Checkbox,
  ColorSwatch,
  Flex,
  Group,
  Paper,
  Popover,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { PROJECT_COLORS } from '@/shared/config'
import { ColorPickerModal } from '@/shared/ui'
import { useCurrentProject } from '@/entities/project'

// Часовые пояса публикаций: значение — IANA-идентификатор, подпись — как в макете
const TIMEZONES = [
  { value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
  { value: 'Asia/Yekaterinburg', label: 'Екатеринбург (UTC+5)' },
  { value: 'Asia/Novosibirsk', label: 'Новосибирск (UTC+7)' },
  { value: 'Asia/Vladivostok', label: 'Владивосток (UTC+10)' },
]

/** Заглушка сохранения — реальный API появится в бэкенде (issue #118). */
function showSavedStub() {
  // TODO (Design First): PATCH профиля/проекта, issue #118. Пока заглушка.
  notifications.show({ color: 'green', message: 'Сохранено (демо)' })
}

/** Заглушка смены пароля — реальный поток появится вместе с бэкендом. */
function handleChangePassword() {
  // TODO (Design First): смена пароля — отдельная backend-задача. Пока ничего не отправляем.
}

export function SettingsPage() {
  const project = useCurrentProject()

  const [projectName, setProjectName] = useState(project?.name ?? '')
  const [projectColor, setProjectColor] = useState(project?.color ?? PROJECT_COLORS[0])
  const [timezone, setTimezone] = useState<string | null>(TIMEZONES[0].value)
  const [telegramReport, setTelegramReport] = useState(true)
  const [failureEmails, setFailureEmails] = useState(false)
  const [watermark, setWatermark] = useState(true)
  const [utmLinks, setUtmLinks] = useState(true)
  const [archiveConfirmOpened, archiveConfirm] = useDisclosure(false)
  const [colorModalOpened, colorModal] = useDisclosure(false)

  const handleArchive = () => {
    // TODO (Design First): POST архивации проекта, issue #118. Пока заглушка.
    notifications.show({ color: 'red', message: 'Проект архивирован (демо)' })
    archiveConfirm.close()
  }

  return (
    <Stack gap="lg">
      <Title order={2}>Настройки</Title>

      {/* Две колонки: «Профиль» слева, «Проект» справа; danger-зона — на всю ширину */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" style={{ alignItems: 'start' }}>
        {/* ===== Профиль ===== */}
        <Paper withBorder radius="lg" p="lg">
          <Stack gap="md">
            <Title order={4}>Профиль</Title>
            <TextInput label="Имя" defaultValue="Мария" />
            <TextInput label="Почта" type="email" defaultValue="maria@otlozhka.ru" />
            <Group>
              <Button variant="default" onClick={handleChangePassword}>
                Сменить пароль
              </Button>
            </Group>
            <Stack gap="xs">
              <Text size="sm" fw={600} c="dimmed">
                Уведомления
              </Text>
              <Checkbox
                label="Отчёт о публикациях в Telegram"
                checked={telegramReport}
                onChange={(event) => setTelegramReport(event.currentTarget.checked)}
              />
              <Checkbox
                label="Письма о сбоях публикации"
                checked={failureEmails}
                onChange={(event) => setFailureEmails(event.currentTarget.checked)}
              />
            </Stack>
            <Group>
              <Button onClick={showSavedStub}>Сохранить</Button>
            </Group>
          </Stack>
        </Paper>

        {/* ===== Проект ===== */}
        <Paper withBorder radius="lg" p="lg">
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
            <Stack gap="xs">
              <Checkbox
                label="Водяной знак на фото"
                checked={watermark}
                onChange={(event) => setWatermark(event.currentTarget.checked)}
              />
              <Checkbox
                label="UTM-метки в ссылках"
                checked={utmLinks}
                onChange={(event) => setUtmLinks(event.currentTarget.checked)}
              />
            </Stack>
            <Group>
              <Button onClick={showSavedStub}>Сохранить</Button>
            </Group>
          </Stack>
        </Paper>

        {/* ===== Архив проекта (danger zone) — на всю ширину грида ===== */}
        <Paper
          withBorder
          radius="lg"
          p="lg"
          style={{
            gridColumn: '1 / -1',
            borderColor: 'var(--mantine-color-red-4)',
            backgroundColor: 'var(--mantine-color-red-0)',
          }}
        >
          {/* На мобильном — колонка: кнопка «Архивировать» переносится под текст
              (align stretch тянет текст на всю ширину, alignSelf держит кнопку слева) */}
          <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" gap="md">
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
                  onClick={archiveConfirm.open}
                  style={{ flex: 'none', alignSelf: 'flex-start' }}
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
          </Flex>
        </Paper>
      </SimpleGrid>

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
