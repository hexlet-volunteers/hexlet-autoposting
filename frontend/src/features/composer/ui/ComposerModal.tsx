import { useRef } from 'react'
import {
  ActionIcon,
  Box,
  Button,
  Chip,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
  IconBold,
  IconItalic,
  IconLink,
  IconList,
  IconPhoto,
  IconSparkles,
} from '@tabler/icons-react'
import { NETWORKS } from '@/shared/config'

/**
 * Глобальный композер поста (features/composer).
 * Состояние открытия приходит пропсами от хоста модалок (widgets/app-shell);
 * экраны открывают композер через useAppModals().openComposer(postId?).
 * Все мутации — заглушки (Design First): реальный сабмит уедет в POST/PUT /api/posts.
 */

// Модели ИИ-помощника — из макета «Композер».
const AI_MODELS = ['YandexGPT 5 Pro', 'GigaChat Max', 'Claude Haiku', 'DeepSeek V3']

// Клиентская заглушка генерации текста (в проде — вызов POST /api/ai/suggest).
function buildMockSuggestion(topic: string): string {
  const subject = topic.trim() || 'вашем продукте'
  return (
    `Рассказываем про ${subject}! ` +
    'Мы подготовили кое-что особенное и хотим поделиться этим с вами первыми. ' +
    'Подробности — в комментариях, а пока ставьте огонёк, если ждёте. 🔥\n\n' +
    '#анонс #отложка'
  )
}

interface FormValues {
  title: string
  content: string
  networks: string[]
  scheduledFor: Date | null
  aiTopic: string
  aiModel: string
}

interface ComposerModalProps {
  opened: boolean
  postId: string | null
  onClose: () => void
}

export function ComposerModal({ opened, postId, onClose }: ComposerModalProps) {
  const isEditing = postId != null
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      content: '',
      networks: [],
      scheduledFor: null,
      aiTopic: '',
      aiModel: AI_MODELS[0],
    },
    validate: {
      title: (value) => (value.trim().length === 0 ? 'Укажите заголовок поста' : null),
      content: (value) => (value.trim().length === 0 ? 'Добавьте текст поста' : null),
      networks: (value) => (value.length === 0 ? 'Выберите хотя бы одну площадку' : null),
      scheduledFor: (value) => (value ? null : 'Укажите дату и время публикации'),
    },
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  // Форматирующая панель — визуальная заглушка: оборачивает выделение маркерами.
  const wrapSelection = (before: string, after: string = before) => {
    const el = textareaRef.current
    const value = form.values.content
    if (!el) {
      form.setFieldValue('content', `${value}${before}${after}`)
      return
    }
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const selected = value.slice(start, end)
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`
    form.setFieldValue('content', next)
  }

  const handleGenerate = () => {
    form.setFieldValue('content', buildMockSuggestion(form.values.aiTopic))
    notifications.show({ color: 'grape', message: 'Текст сгенерирован (демо)' })
  }

  const handleAddMedia = () => {
    // TODO (Design First): открыть загрузку в медиатеку → POST /api/media.
    notifications.show({ color: 'green', message: 'Выбор медиа (демо)' })
  }

  const handleSubmit = form.onSubmit(() => {
    // TODO (Design First): создание/обновление поста →
    // POST /api/posts (новый) или PUT /api/posts/{id} (postId).
    notifications.show({
      color: 'green',
      message: isEditing ? 'Пост обновлён (демо)' : 'Пост запланирован (демо)',
    })
    handleClose()
  })

  const handleSaveDraft = () => {
    // TODO (Design First): сохранение черновика → POST /api/posts?status=draft.
    notifications.show({ color: 'green', message: 'Черновик сохранён (демо)' })
    handleClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="lg"
      title={
        <Text fw={800} fz="lg">
          {isEditing ? 'Редактирование поста' : 'Новый пост'}
        </Text>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Заголовок поста"
            placeholder="Новогодние сеты: что внутри"
            withAsterisk
            {...form.getInputProps('title')}
          />

          <Box>
            <Group gap={4} mb={6}>
              <Tooltip label="Жирный">
                <ActionIcon
                  variant="default"
                  aria-label="Жирный"
                  onClick={() => wrapSelection('**')}
                >
                  <IconBold size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Курсив">
                <ActionIcon
                  variant="default"
                  aria-label="Курсив"
                  onClick={() => wrapSelection('_')}
                >
                  <IconItalic size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Ссылка">
                <ActionIcon
                  variant="default"
                  aria-label="Ссылка"
                  onClick={() => wrapSelection('[', '](https://)')}
                >
                  <IconLink size={16} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Список">
                <ActionIcon
                  variant="default"
                  aria-label="Список"
                  onClick={() => wrapSelection('\n• ', '')}
                >
                  <IconList size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Textarea
              label="Текст поста"
              placeholder="О чём расскажем подписчикам?"
              autosize
              minRows={4}
              withAsterisk
              ref={textareaRef}
              {...form.getInputProps('content')}
            />
          </Box>

          <Box
            style={{
              background: 'rgba(110,91,255,.06)',
              border: '1px solid rgba(110,91,255,.25)',
              borderRadius: 12,
              padding: 12,
            }}
          >
            <Group gap={8} mb={10}>
              <IconSparkles size={15} color="#6E5BFF" />
              <Text fw={700} fz="sm" c="#6E5BFF">
                ИИ-помощник
              </Text>
              <Select
                ml="auto"
                size="xs"
                data={AI_MODELS}
                allowDeselect={false}
                {...form.getInputProps('aiModel')}
              />
            </Group>
            <Group gap={8} align="flex-end" wrap="nowrap">
              <TextInput
                style={{ flex: 1 }}
                placeholder="О чём написать? Например: анонс новогодних сетов"
                {...form.getInputProps('aiTopic')}
              />
              <Button color="grape" onClick={handleGenerate}>
                Сгенерировать
              </Button>
            </Group>
            <Text fz="xs" c="dimmed" mt={8}>
              Текст появится в поле выше — правьте как угодно
            </Text>
          </Box>

          <Box>
            <Text fz="sm" fw={600} c="dimmed" mb={8}>
              Куда публикуем
            </Text>
            <Chip.Group multiple {...form.getInputProps('networks')}>
              <Group gap={8}>
                {NETWORKS.map((network) => (
                  <Chip key={network.id} value={network.id}>
                    {network.name}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
            {form.errors.networks && (
              <Text fz="xs" c="red" mt={6}>
                {form.errors.networks}
              </Text>
            )}
          </Box>

          <DateTimePicker
            label="Дата и время публикации"
            placeholder="Выберите дату и время"
            withAsterisk
            valueFormat="D MMMM YYYY, HH:mm"
            {...form.getInputProps('scheduledFor')}
          />

          <Box>
            <Text fz="sm" fw={600} c="dimmed" mb={8}>
              Вложения
            </Text>
            <Group gap={8}>
              {/* Плейсхолдеры-миниатюры вложений (в проде — превью из медиатеки). */}
              <Box
                style={{
                  width: 64,
                  height: 52,
                  borderRadius: 9,
                  background: '#F6F4EF',
                  border: '1.5px dashed rgba(23,21,15,.25)',
                }}
              />
              <Box
                style={{
                  width: 64,
                  height: 52,
                  borderRadius: 9,
                  background: '#F6F4EF',
                  border: '1.5px dashed rgba(23,21,15,.25)',
                }}
              />
              <Button
                variant="light"
                leftSection={<IconPhoto size={16} />}
                onClick={handleAddMedia}
              >
                Добавить медиа
              </Button>
              <Text fz="xs" c="dimmed" style={{ alignSelf: 'center' }}>
                до 4 фото
              </Text>
            </Group>
          </Box>

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={handleSaveDraft}>
              Сохранить черновик
            </Button>
            <Button type="submit">Запланировать</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
