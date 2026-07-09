import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Image,
  Modal,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconUpload } from '@tabler/icons-react'
import {
  useMedia,
  useDeleteMediaMutation,
  PlayOverlay,
  formatDateShort,
  getMediaTypeLabel,
  MEDIA_PREVIEW_FALLBACK,
} from '@/entities/media'
import type { Media } from '@/entities/media'
import { MediaUploadModal } from '@/features/media-upload'
import { MediaGallery, MediaGallerySkeleton } from '@/widgets/media-gallery'
import { EmptyState, QueryState } from '@/shared/ui'
import classes from './MediaPage.module.css'

const PLACEHOLDER_BG = '#F6F4EF'
const DASHED_BORDER = '1.5px dashed rgba(23,21,15,.2)'
// Красный удаления из макета (кнопка «Удалить» в предпросмотре).
const DANGER_COLOR = '#C4352D'

export function MediaPage() {
  const { data, isLoading, error } = useMedia()
  const media = data ?? []

  const [uploadOpened, upload] = useDisclosure(false)
  const [selected, setSelected] = useState<Media | null>(null)
  // Подтверждение удаления (действие необратимо) — отдельная маленькая модалка.
  const [confirmOpened, confirm] = useDisclosure(false)

  const deleteMedia = useDeleteMediaMutation()

  // Удаление после подтверждения: мок-мутация правит кэш, плитка исчезает из сетки сразу.
  const handleConfirmDelete = () => {
    if (!selected) return
    deleteMedia.mutate(selected.id, {
      onSuccess: () => {
        notifications.show({ color: 'green', message: 'Медиа удалено (демо)' })
        confirm.close()
        setSelected(null)
      },
    })
  }

  // Строка метаданных по макету: «ТИП · РАЗМЕР · загружено ДАТА».
  const mediaMeta = selected
    ? `${getMediaTypeLabel(selected)} · ${selected.sizeLabel} · загружено ${formatDateShort(
        selected.uploadedAt,
      )}`
    : ''

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

      {/* ===== Загрузка в медиатеку (features/media-upload) ===== */}
      <MediaUploadModal opened={uploadOpened} onClose={upload.close} />

      {/* ===== Предпросмотр медиа ===== */}
      <Modal
        opened={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name}
        radius="lg"
        centered
        size={520}
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
          <Stack gap={12}>
            {/* Метаданные одной строкой по макету: «ТИП · РАЗМЕР · загружено ДАТА» */}
            <Text fz={12} c="dimmed">
              {mediaMeta}
            </Text>

            <Box
              style={{
                position: 'relative',
                aspectRatio: '16 / 10',
                border: DASHED_BORDER,
                borderRadius: 12,
                background: PLACEHOLDER_BG,
                overflow: 'hidden',
              }}
            >
              {/* Реальное превью по url; при пустом/битом url — аккуратный fallback */}
              <Image
                src={selected.url}
                fallbackSrc={MEDIA_PREVIEW_FALLBACK}
                fit="contain"
                w="100%"
                h="100%"
                alt={selected.name}
              />
              {/* Для видео — круглая иконка play по центру превью, у фото её нет */}
              {selected.kind === 'video' ? <PlayOverlay /> : null}
            </Box>

            <Group justify="space-between" mt={4}>
              <Button variant="outline" color={DANGER_COLOR} radius="md" onClick={confirm.open}>
                Удалить
              </Button>
              <Button radius="md" className={classes.closeButton} onClick={() => setSelected(null)}>
                Закрыть
              </Button>
            </Group>
          </Stack>
        ) : null}
      </Modal>

      {/* ===== Подтверждение удаления ===== */}
      <Modal
        opened={confirmOpened}
        onClose={confirm.close}
        title="Удалить медиа?"
        radius="lg"
        centered
        size="sm"
        styles={{ title: { fontWeight: 800, fontSize: 15 } }}
      >
        <Text fz={13.5}>Файл «{selected?.name}» будет удалён из медиатеки безвозвратно.</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="default" radius="md" onClick={confirm.close}>
            Отмена
          </Button>
          <Button
            color={DANGER_COLOR}
            radius="md"
            loading={deleteMedia.isPending}
            onClick={handleConfirmDelete}
          >
            Удалить
          </Button>
        </Group>
      </Modal>
    </Container>
  )
}
