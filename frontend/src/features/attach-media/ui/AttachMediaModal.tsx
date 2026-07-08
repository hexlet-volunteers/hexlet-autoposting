import { Modal, SimpleGrid, Text, UnstyledButton } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import type { FileRejection } from '@mantine/dropzone'
import { UploadDropzone, useMedia, useUploadMediaMutation } from '@/entities/media'
import { ATTACHMENT_KIND_CONFIG } from '../model/config'
import type { AttachmentKind } from '../model/config'
import classes from './AttachMediaModal.module.css'

interface AttachMediaModalProps {
  opened: boolean
  /** Тип вложения от вызывающего (композера): фото / видео / обложка. */
  kind: AttachmentKind
  onClose: () => void
  /**
   * Итог выбора — id медиа: существующего из медиатеки или только что
   * загруженного. Модалка про пост ничего не знает, прикрепление — на вызывающем.
   */
  onSelect: (mediaId: string) => void
}

/**
 * Модалка «Загрузка файла»: дроп-зона с валидацией по типу вложения и,
 * для фото/обложки, быстрый выбор из первых четырёх фото медиатеки.
 * Загруженный через зону файл тоже попадает в медиатеку (мок-уровень),
 * а наружу в обоих случаях уходит mediaId через onSelect.
 */
export function AttachMediaModal({ opened, kind, onClose, onSelect }: AttachMediaModalProps) {
  const config = ATTACHMENT_KIND_CONFIG[kind]
  const upload = useUploadMediaMutation()
  const { data } = useMedia()
  // Первые 4 фото медиатеки — плитки быстрого выбора, как в макете.
  const libraryPhotos = (data ?? []).filter((item) => item.kind === 'photo').slice(0, 4)

  const pick = (mediaId: string) => {
    onSelect(mediaId)
    onClose()
  }

  // Файл сперва «загружается» в медиатеку, затем его id уходит вызывающему.
  // mutateAsync вместо mutate: колбэки mutate() при повторных вызовах одного
  // useMutation перекрывают друг друга (см. MediaUploadModal).
  const handleDrop = (files: File[]) => {
    const file = files[0]
    if (!file) return
    void upload.mutateAsync(file).then(({ item }) => pick(item.id))
  }

  // Клиентская валидация не прошла (тип или размер) — объясняем, что подходит.
  const handleReject = (rejections: FileRejection[]) => {
    const names = rejections.map((rejection) => rejection.file.name).join(', ')
    notifications.show({
      color: 'red',
      message: `Файл не подходит: ${names}. Допустимы ${config.formatsLabel}.`,
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={config.title}
      radius="lg"
      centered
      size={460}
      styles={{ title: { fontWeight: 800, fontSize: 17, letterSpacing: '-.2px' } }}
    >
      <UploadDropzone
        accept={config.accept}
        maxSize={config.maxSize}
        title="Перетащите файл сюда"
        hint={`или нажмите, чтобы выбрать с компьютера · ${config.formatsLabel}`}
        loading={upload.isPending}
        onDrop={handleDrop}
        onReject={handleReject}
      />

      {/* Для фото и обложки — быстрый выбор из существующих фото медиатеки */}
      {config.withLibrary && libraryPhotos.length > 0 ? (
        <>
          <Text mt={14} fz={12.5} fw={600} style={{ color: 'rgba(23,21,15,.6)' }}>
            Или выберите из медиатеки
          </Text>
          <SimpleGrid cols={4} spacing={8} mt={8}>
            {libraryPhotos.map((photo) => (
              <UnstyledButton
                key={photo.id}
                className={classes.libraryTile}
                title={photo.name}
                onClick={() => pick(photo.id)}
              >
                <Text component="span" fz={10.5} c="inherit" lineClamp={2} px={4}>
                  {photo.name}
                </Text>
              </UnstyledButton>
            ))}
          </SimpleGrid>
        </>
      ) : null}
    </Modal>
  )
}
