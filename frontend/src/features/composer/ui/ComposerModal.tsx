import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  FileButton,
  Group,
  Modal,
  Popover,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'
import { IconChevronDown, IconSparkles } from '@tabler/icons-react'
import { usePost } from '@/entities/scheduled-post'
import { incrementAiUsage, useQuota } from '@/entities/subscription'
import { NETWORKS } from '@/shared/config'
import { useCreatePost } from '../api/useCreatePost'
import { useDeletePost } from '../api/useDeletePost'
import { useUpdatePost } from '../api/useUpdatePost'
import { plural } from '../lib/plural'
import { AI_ACCENT, buildAiVideoDescription } from '../model/aiAssist'
import {
  DAY_LABELS,
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  REPEAT_HINTS,
  REPEAT_OPTIONS,
  SECOND_OPTIONS,
  VIDEO_NETWORK_IDS,
  buildPostTitle,
  buildScheduledAt,
  htmlToPlainText,
  makeDefaultValues,
  makeValuesFromPost,
} from '../model/composerForm'
import type { ComposerFormValues, PostKind, RepeatMode } from '../model/composerForm'
import { AiAssistPanel } from './AiAssistPanel'
import { RichTextArea } from './RichTextArea'

/**
 * Глобальный композер поста (features/composer) — по макету app-dashboard.html.
 * Состояние открытия приходит пропсами от хоста модалок (widgets/app-shell);
 * экраны открывают композер через useAppModals().openComposer(postId?).
 * Мутации — мок-хуки ../api поверх кэша ['scheduled-posts'] (Design First).
 * Панель ИИ-помощника — отдельный сегмент ./AiAssistPanel + ../model/aiAssist.
 */

// Цвета из макета app-dashboard: красная ссылка удаления,
// приглушённые рамки-пунктиры и фон плиток вложений.
const DANGER_TEXT = '#C4352D'
const MUTED_DASH = 'rgba(23,21,15,.25)'
const TILE_BG = '#F6F4EF'

interface ComposerModalProps {
  opened: boolean
  postId: string | null
  onClose: () => void
}

export function ComposerModal({ opened, postId, onClose }: ComposerModalProps) {
  const isEditing = postId != null
  const post = usePost(postId ?? undefined)

  const createPost = useCreatePost()
  const updatePost = useUpdatePost()
  const deletePost = useDeletePost()

  const queryClient = useQueryClient()
  const aiQuota = useQuota('ai')
  // Мягкий enforcement квоты постов (#211): блокируем только СОЗДАНИЕ —
  // редактирование существующего поста лимит не расходует.
  const postsQuota = useQuota('posts')
  const postsBlocked = !isEditing && postsQuota.exhausted
  const [timeOpen, setTimeOpen] = useState(false)

  const form = useForm<ComposerFormValues>({ initialValues: makeDefaultValues() })

  // Преднастройка формы при открытии: данные поста в режиме редактирования,
  // пустые значения — при создании.
  useEffect(() => {
    if (!opened) return
    form.setValues(post ? makeValuesFromPost(post) : makeDefaultValues())
    // Форму пересобираем только при открытии/смене поста
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, post?.id])

  const isVideo = form.values.kind === 'video'

  // Для типа «Пост» видеоплощадки не считаются (они заблокированы)
  const selectedNetworks = form.values.networks.filter(
    (id) => isVideo || !VIDEO_NETWORK_IDS.includes(id),
  )
  const selectedCount = selectedNetworks.length

  const handleClose = () => {
    form.reset()
    // Локальное состояние сбрасываем при закрытии, чтобы следующее открытие было чистым
    setTimeOpen(false)
    onClose()
  }

  const handleKindChange = (value: string) => {
    const kind = value as PostKind
    form.setFieldValue('kind', kind)
    // Как в макете: при возврате к «Посту» снимаем выбор с видеоплощадок
    if (kind === 'post') {
      form.setFieldValue(
        'networks',
        form.values.networks.filter((id) => !VIDEO_NETWORK_IDS.includes(id)),
      )
    }
  }

  const handleAddPhoto = (file: File | null) => {
    if (!file || form.values.attachments.length >= 4) return
    form.insertListItem('attachments', file.name)
  }

  const handleAiDescription = () => {
    if (aiQuota.exhausted) return
    form.setFieldValue('videoDescription', buildAiVideoDescription())
    incrementAiUsage(queryClient)
    notifications.show({ color: 'grape', message: 'Описание сгенерировано (демо)' })
  }

  const handleDelete = () => {
    if (!postId) return
    deletePost(postId)
    handleClose()
  }

  const handleSubmit = form.onSubmit((values) => {
    if (selectedCount === 0 || postsBlocked) return
    const mediaCount = values.kind === 'video' ? 0 : values.attachments.length
    const draft = {
      title: buildPostTitle(values),
      text: values.kind === 'video' ? values.videoDescription.trim() : htmlToPlainText(values.text),
      networkIds: selectedNetworks,
      scheduledAt: buildScheduledAt(values),
      mediaCount: mediaCount > 0 ? mediaCount : undefined,
    }
    if (isEditing && postId) {
      updatePost(postId, draft)
    } else {
      createPost(draft)
    }
    handleClose()
  })

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="lg"
      title={
        <Group gap="sm">
          <Text fw={800} fz="lg">
            {isEditing ? 'Настройки поста' : 'Новый пост'}
          </Text>
          <SegmentedControl
            size="xs"
            radius="md"
            color="dark"
            value={form.values.kind}
            onChange={handleKindChange}
            data={[
              { label: 'Пост', value: 'post' },
              { label: 'Видео', value: 'video' },
            ]}
          />
        </Group>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {!isVideo && (
            <>
              <RichTextArea
                value={form.values.text}
                onChange={(html) => form.setFieldValue('text', html)}
                placeholder="О чём расскажем подписчикам?"
              />

              {/* Панель ИИ-помощника: асинхронная мок-генерация, тон, варианты, «по фото» */}
              <AiAssistPanel
                hasPhoto={form.values.attachments.length > 0}
                onInsert={(text) => form.setFieldValue('text', text)}
              />

              {/* Вложения-фото (мок): плитки с именами файлов, до 4 штук */}
              <Box>
                <Text fz="sm" fw={600} c="dimmed" mb={8}>
                  Фото
                </Text>
                <Group gap={8}>
                  {form.values.attachments.map((name, index) => (
                    <Tooltip key={`${name}-${index}`} label="Убрать фото">
                      <UnstyledButton
                        onClick={() => form.removeListItem('attachments', index)}
                        style={{
                          width: 64,
                          height: 52,
                          borderRadius: 9,
                          background: TILE_BG,
                          border: `1.5px dashed ${MUTED_DASH}`,
                          fontSize: 10.5,
                          color: 'var(--mantine-color-dimmed)',
                          textAlign: 'center',
                          overflow: 'hidden',
                          padding: 2,
                        }}
                      >
                        {name}
                      </UnstyledButton>
                    </Tooltip>
                  ))}
                  {form.values.attachments.length < 4 && (
                    <FileButton onChange={handleAddPhoto} accept="image/png,image/jpeg,image/webp">
                      {(props) => (
                        <UnstyledButton
                          {...props}
                          style={{
                            width: 64,
                            height: 52,
                            borderRadius: 9,
                            border: '1.5px dashed var(--mantine-color-brand-3)',
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--mantine-color-brand-6)',
                            textAlign: 'center',
                          }}
                        >
                          + Фото
                        </UnstyledButton>
                      )}
                    </FileButton>
                  )}
                  <Text fz="xs" c="dimmed" style={{ alignSelf: 'center' }}>
                    до 4 фото
                  </Text>
                </Group>
              </Box>
            </>
          )}

          {isVideo && (
            <>
              {/* Зона загрузки видеофайла */}
              <FileButton
                onChange={(file) => file && form.setFieldValue('videoFile', file.name)}
                accept="video/mp4,video/*"
              >
                {(props) => (
                  <UnstyledButton
                    {...props}
                    style={{
                      width: '100%',
                      border: `1.5px dashed ${
                        form.values.videoFile ? 'var(--mantine-color-success-4)' : MUTED_DASH
                      }`,
                      borderRadius: 12,
                      background: TILE_BG,
                      padding: 18,
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                      color: form.values.videoFile
                        ? 'var(--mantine-color-success-7)'
                        : 'var(--mantine-color-dimmed)',
                    }}
                  >
                    {form.values.videoFile
                      ? `✓ ${form.values.videoFile} — нажмите, чтобы заменить`
                      : 'Перетащите видео сюда или нажмите, чтобы выбрать · до 2 ГБ, MP4'}
                  </UnstyledButton>
                )}
              </FileButton>

              <Box style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 132px', gap: 14 }}>
                <Stack gap="xs">
                  <TextInput
                    label="Название"
                    placeholder="Новогодние сеты: что внутри"
                    {...form.getInputProps('videoTitle')}
                  />
                  <Box>
                    <Group justify="space-between" mb={6}>
                      <Text fz="sm" fw={600} c="dimmed">
                        Описание
                      </Text>
                      <Button
                        size="compact-xs"
                        variant="default"
                        leftSection={<IconSparkles size={11} />}
                        disabled={aiQuota.exhausted}
                        onClick={handleAiDescription}
                        styles={{
                          root: {
                            color: AI_ACCENT,
                            borderColor: 'rgba(110,91,255,.4)',
                            background: 'rgba(110,91,255,.07)',
                          },
                        }}
                      >
                        ИИ-описание
                      </Button>
                    </Group>
                    <Textarea
                      rows={3}
                      placeholder="Описание для YouTube, RUTUBE и VK Видео"
                      {...form.getInputProps('videoDescription')}
                    />
                  </Box>
                </Stack>
                <Box>
                  <Text fz="sm" fw={600} c="dimmed" mb={6}>
                    Обложка
                  </Text>
                  <FileButton
                    onChange={(file) => file && form.setFieldValue('cover', file.name)}
                    accept="image/png,image/jpeg,image/webp"
                  >
                    {(props) => (
                      <UnstyledButton
                        {...props}
                        style={{
                          width: '100%',
                          aspectRatio: '16/10',
                          border: `1.5px dashed ${
                            form.values.cover ? 'var(--mantine-color-success-4)' : MUTED_DASH
                          }`,
                          borderRadius: 10,
                          background: TILE_BG,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 600,
                          textAlign: 'center',
                          padding: 6,
                          overflow: 'hidden',
                          color: form.values.cover
                            ? 'var(--mantine-color-success-7)'
                            : 'var(--mantine-color-dimmed)',
                        }}
                      >
                        {form.values.cover ? `✓ ${form.values.cover}` : '1280 × 720'}
                      </UnstyledButton>
                    )}
                  </FileButton>
                </Box>
              </Box>
            </>
          )}

          {/* Площадки: активные заливаются брендовым цветом, RT/YT доступны только «Видео» */}
          <Box>
            <Text fz="sm" fw={600} c="dimmed" mb={8}>
              Куда публикуем
            </Text>
            <Chip.Group
              multiple
              value={form.values.networks}
              onChange={(value) => form.setFieldValue('networks', value)}
            >
              <Group gap={6}>
                {NETWORKS.map((network) => {
                  const blocked = !isVideo && VIDEO_NETWORK_IDS.includes(network.id)
                  const checked = !blocked && form.values.networks.includes(network.id)
                  const chip = (
                    <Chip
                      value={network.id}
                      disabled={blocked}
                      radius="pill"
                      styles={
                        checked
                          ? {
                              label: {
                                backgroundColor: network.color,
                                color: 'var(--mantine-color-white)',
                              },
                            }
                          : undefined
                      }
                    >
                      {network.name}
                    </Chip>
                  )
                  return blocked ? (
                    <Tooltip
                      key={network.id}
                      label="Видеоплатформа: доступна только для типа «Видео»"
                    >
                      <Box>{chip}</Box>
                    </Tooltip>
                  ) : (
                    <Box key={network.id}>{chip}</Box>
                  )
                })}
              </Group>
            </Chip.Group>
            <Text fz="xs" c="dimmed" mt={8}>
              {isVideo
                ? 'Видео загрузим в VK Видео, RUTUBE и YouTube; в остальные сети уйдёт пост со ссылкой на ролик'
                : 'RUTUBE и YouTube — видеоплатформы: доступны только для типа «Видео»'}
            </Text>
          </Box>

          {/* Расписание: день недели + время (часы/минуты/секунды) + повтор */}
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) auto auto',
              gap: 14,
              alignItems: 'start',
            }}
          >
            <Box>
              <Text fz="sm" fw={600} c="dimmed" mb={8}>
                День
              </Text>
              <Group gap={5} wrap="nowrap">
                {DAY_LABELS.map((label, index) => {
                  const active = form.values.day === index
                  return (
                    <Button
                      key={label}
                      size="compact-md"
                      radius={9}
                      px={2}
                      variant={active ? 'filled' : 'default'}
                      color="dark"
                      style={{ flex: 1, minWidth: 0 }}
                      styles={{ label: { fontSize: 12.5, overflow: 'visible' } }}
                      onClick={() => form.setFieldValue('day', index)}
                    >
                      {label}
                    </Button>
                  )
                })}
              </Group>
            </Box>
            <Box>
              <Text fz="sm" fw={600} c="dimmed" mb={8}>
                Время
              </Text>
              <Popover
                opened={timeOpen}
                onChange={setTimeOpen}
                position="top-end"
                shadow="lg"
                trapFocus={false}
              >
                <Popover.Target>
                  <Button
                    variant="default"
                    onClick={() => setTimeOpen((open) => !open)}
                    rightSection={<IconChevronDown size={13} />}
                    styles={{ label: { fontWeight: 700, letterSpacing: 0.5 } }}
                  >
                    {form.values.hours}:{form.values.minutes}:{form.values.seconds}
                  </Button>
                </Popover.Target>
                <Popover.Dropdown w={250} p="sm">
                  <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {['часы', 'минуты', 'секунды'].map((label) => (
                      <Text
                        key={label}
                        fz={10.5}
                        fw={700}
                        tt="uppercase"
                        ta="center"
                        c="dimmed"
                        style={{ letterSpacing: 0.5 }}
                      >
                        {label}
                      </Text>
                    ))}
                  </Box>
                  <Box
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}
                    mt={7}
                  >
                    <TimeColumn
                      options={HOUR_OPTIONS}
                      value={form.values.hours}
                      onPick={(value) => form.setFieldValue('hours', value)}
                    />
                    <TimeColumn
                      options={MINUTE_OPTIONS}
                      value={form.values.minutes}
                      onPick={(value) => form.setFieldValue('minutes', value)}
                    />
                    <TimeColumn
                      options={SECOND_OPTIONS}
                      value={form.values.seconds}
                      onPick={(value) => form.setFieldValue('seconds', value)}
                    />
                  </Box>
                  <Button fullWidth mt="xs" color="dark" onClick={() => setTimeOpen(false)}>
                    Готово
                  </Button>
                </Popover.Dropdown>
              </Popover>
            </Box>
            <Box>
              <Text fz="sm" fw={600} c="dimmed" mb={8}>
                Повторять
              </Text>
              <Select
                data={REPEAT_OPTIONS}
                value={form.values.repeat}
                onChange={(value) => form.setFieldValue('repeat', (value ?? 'none') as RepeatMode)}
                allowDeselect={false}
                w={150}
              />
              <Text fz={10.5} c="dimmed" mt={5}>
                {REPEAT_HINTS[form.values.repeat]}
              </Text>
            </Box>
          </Box>

          {/* Футер: удаление (в редактировании), подсказка о публикациях, Отмена/сабмит */}
          <Group gap="sm" mt="xs">
            {isEditing && (
              <UnstyledButton
                onClick={handleDelete}
                style={{ color: DANGER_TEXT, fontSize: 13.5, fontWeight: 600 }}
              >
                Удалить пост
              </UnstyledButton>
            )}
            <Text fz="sm" c={postsBlocked ? 'red.7' : 'dimmed'} ml="auto">
              {postsBlocked
                ? 'Достигнут лимит постов тарифа — улучшите тариф'
                : selectedCount === 0
                  ? 'Выберите хотя бы одну площадку'
                  : `Выйдет ${selectedCount} ${plural(selectedCount, [
                      'публикация',
                      'публикации',
                      'публикаций',
                    ])}`}
            </Text>
            <Button variant="default" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={selectedCount === 0 || postsBlocked}>
              {isEditing ? 'Сохранить' : 'В отложку'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

interface TimeColumnProps {
  options: readonly string[]
  value: string
  onPick: (value: string) => void
}

/** Прокручиваемая колонка пикера времени (часы/минуты/секунды). */
function TimeColumn({ options, value, onPick }: TimeColumnProps) {
  return (
    <ScrollArea h={158} type="auto">
      <Stack gap={2} pr={2}>
        {options.map((option) => {
          const active = option === value
          return (
            <Button
              key={option}
              size="compact-sm"
              radius={7}
              variant={active ? 'filled' : 'subtle'}
              color={active ? 'dark' : 'gray'}
              onClick={() => onPick(option)}
            >
              {option}
            </Button>
          )
        })}
      </Stack>
    </ScrollArea>
  )
}
