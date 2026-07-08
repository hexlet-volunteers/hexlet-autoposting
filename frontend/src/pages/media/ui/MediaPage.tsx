import { useRef, useState } from 'react'
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Modal,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconUpload } from '@tabler/icons-react'
import { useMedia, MediaThumb } from '@/entities/media'
import type { Media } from '@/entities/media'
import { MediaGallery, MediaGallerySkeleton } from '@/widgets/media-gallery'
import { EmptyState, QueryState, ConfirmDeleteButton } from '@/shared/ui'
import { formatDateTime } from '@/shared/lib'

const PLACEHOLDER_BG = '#F6F4EF'
const DASHED_BORDER = '1.5px dashed rgba(23,21,15,.2)'

export function MediaPage() {
  const { data, isLoading, error } = useMedia()
  const media = data ?? []

  const [uploadOpened, upload] = useDisclosure(false)
  const [selected, setSelected] = useState<Media | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Загрузка — заглушка: реальная отправка появится с Design First.
  const handleUpload = () => {
    // TODO (Design First, backlog): POST /media (multipart) + инвалидация mediaKeys.all.
    notifications.show({ color: 'green', message: 'Файлы загружены в медиатеку (демо)' })
    upload.close()
  }

  // Удаление — заглушка.
  const handleDelete = () => {
    // TODO (Design First, backlog): DELETE /media/{id} + инвалидация mediaKeys.all.
    notifications.show({ color: 'green', message: 'Медиа удалено (демо)' })
    setSelected(null)
  }

  return (
    <Container size="lg" px={0}>
      {/* Карточка медиатеки по макету: белый фон, бордер, radius 16, padding 18 */}
      <Card withBorder radius={16} p={18} style={{ borderColor: 'rgba(23,21,15,.1)' }}>
        <Group align="center" gap={10} wrap="wrap" mb="md">
          <Title order={1} fz={14.5} fw={700}>
            Фото и видео проекта
          </Title>
          <Box style={{ flex: 1 }} />
          <Button
            color="brand"
            radius="md"
            leftSection={<IconUpload size={17} />}
            onClick={upload.open}
          >
            Загрузить
          </Button>
        </Group>

        {/* Скелетоны сетки показываем сами, поэтому isLoading в QueryState не передаём */}
        <QueryState isLoading={false} error={error}>
          {isLoading ? (
            <MediaGallerySkeleton />
          ) : media.length === 0 ? (
            <EmptyState
              title="В медиатеке пусто"
              description="Загрузите фото и видео, чтобы прикреплять их к постам."
              action={
                <Button
                  color="brand"
                  radius="md"
                  leftSection={<IconUpload size={17} />}
                  onClick={upload.open}
                >
                  Загрузить
                </Button>
              }
            />
          ) : (
            <MediaGallery media={media} onSelect={setSelected} onAdd={upload.open} />
          )}
        </QueryState>
      </Card>

      {/* ===== Загрузка в медиатеку ===== */}
      <Modal
        opened={uploadOpened}
        onClose={upload.close}
        title="Загрузка в медиатеку"
        radius="lg"
        centered
        styles={{ title: { fontWeight: 800, fontSize: 17, letterSpacing: '-.2px' } }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,video/mp4"
          hidden
          onChange={handleUpload}
        />
        <UnstyledButton
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'block',
            width: '100%',
            border: '1.5px dashed rgba(43,80,236,.45)',
            borderRadius: 12,
            background: 'rgba(43,80,236,.04)',
            padding: '30px 16px',
            textAlign: 'center',
          }}
        >
          <Text fz={13.5} fw={700} c="brand">
            Перетащите файлы сюда
          </Text>
          <Text mt={4} fz={12} c="dimmed">
            или нажмите, чтобы выбрать · JPG, PNG, MP4 до 2 ГБ
          </Text>
        </UnstyledButton>
        <Button fullWidth mt="md" color="brand" radius="md" onClick={handleUpload}>
          Готово
        </Button>
      </Modal>

      {/* ===== Предпросмотр медиа ===== */}
      <Modal
        opened={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name}
        radius="lg"
        centered
        size="lg"
        styles={{
          title: {
            fontWeight: 800,
            fontSize: 15,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        }}
      >
        {selected ? (
          <Stack gap="md">
            <Box
              style={{
                aspectRatio: '16 / 10',
                border: DASHED_BORDER,
                borderRadius: 12,
                background: PLACEHOLDER_BG,
                display: 'flex',
                flexDirection: 'column',
                gap: 9,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MediaThumb kind={selected.kind} size={30} />
              <Text fz={12.5} c="dimmed">
                предпросмотр · {selected.name}
              </Text>
            </Box>

            <Stack gap={6}>
              <Group gap={8} wrap="nowrap">
                <Text fz={13} c="dimmed" style={{ minWidth: 64 }}>
                  Имя
                </Text>
                <Text fz={13} fw={600} lineClamp={1}>
                  {selected.name}
                </Text>
              </Group>
              <Group gap={8} wrap="nowrap">
                <Text fz={13} c="dimmed" style={{ minWidth: 64 }}>
                  Тип
                </Text>
                <Text fz={13} fw={600}>
                  {selected.kind === 'video' ? 'Видео' : 'Фото'}
                </Text>
              </Group>
              <Group gap={8} wrap="nowrap">
                <Text fz={13} c="dimmed" style={{ minWidth: 64 }}>
                  Размер
                </Text>
                <Text fz={13} fw={600}>
                  {selected.sizeLabel}
                </Text>
              </Group>
              <Group gap={8} wrap="nowrap">
                <Text fz={13} c="dimmed" style={{ minWidth: 64 }}>
                  Дата
                </Text>
                <Text fz={13} fw={600}>
                  {formatDateTime(selected.uploadedAt)}
                </Text>
              </Group>
            </Stack>

            <Group justify="space-between" mt="xs">
              <ConfirmDeleteButton
                onConfirm={handleDelete}
                tooltip="Удалить медиа"
                confirmText="Удалить медиа безвозвратно?"
              />
              <Button variant="default" radius="md" onClick={() => setSelected(null)}>
                Закрыть
              </Button>
            </Group>
          </Stack>
        ) : null}
      </Modal>
    </Container>
  )
}
