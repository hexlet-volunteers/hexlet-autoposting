import { useState } from 'react'
import { Button, Group, Loader, Modal, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCheck } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import type { FileRejection } from '@mantine/dropzone'
import {
  UploadDropzone,
  useUploadMediaMutation,
  mediaKeys,
  pluralizeRu,
  FILE_PLURAL_FORMS,
  MEDIA_LIBRARY_ACCEPT,
  MEDIA_LIBRARY_FORMATS_LABEL,
  MEDIA_MAX_VIDEO_SIZE,
} from '@/entities/media'

/** Строка пофайлового статуса текущего сеанса загрузки. */
interface UploadRow {
  key: string
  name: string
  status: 'uploading' | 'done'
}

// Сквозной счётчик ключей строк: имена файлов могут повторяться в одном дропе.
let rowCounter = 0

interface MediaUploadModalProps {
  opened: boolean
  onClose: () => void
}

/**
 * Модалка «Загрузка в медиатеку»: мульти-выбор через дроп-зону, пофайловый
 * мок-прогресс и счётчик «Загружено в этой сессии». Кнопка «Готово» закрывает
 * модалку и инвалидирует запрос медиатеки — сетка обновляется.
 */
export function MediaUploadModal({ opened, onClose }: MediaUploadModalProps) {
  const [rows, setRows] = useState<UploadRow[]>([])
  const upload = useUploadMediaMutation()
  const queryClient = useQueryClient()

  // Каждый файл «грузится» отдельно: свой лоадер, своя отметка «готово».
  const handleDrop = (files: File[]) => {
    files.forEach((file) => {
      rowCounter += 1
      const key = `upload-row-${rowCounter}`
      setRows((prev) => [...prev, { key, name: file.name, status: 'uploading' }])
      // Именно mutateAsync: колбэки mutate() при параллельных вызовах одного
      // useMutation перекрывают друг друга, и ранние файлы «зависали» бы в загрузке.
      void upload.mutateAsync(file).then(() => {
        setRows((prev) => prev.map((row) => (row.key === key ? { ...row, status: 'done' } : row)))
      })
    })
  }

  // Клиентская валидация не прошла (тип или размер) — объясняем, что подходит.
  const handleReject = (rejections: FileRejection[]) => {
    const names = rejections.map((rejection) => rejection.file.name).join(', ')
    notifications.show({
      color: 'red',
      message: `Не удалось добавить: ${names}. Подходят только ${MEDIA_LIBRARY_FORMATS_LABEL}.`,
    })
  }

  // Тот самый TODO из MediaPage: после загрузки обновляем сетку медиатеки.
  const handleDone = () => {
    void queryClient.invalidateQueries({ queryKey: mediaKeys.all })
    onClose()
  }

  const doneCount = rows.filter((row) => row.status === 'done').length

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Загрузка в медиатеку"
      radius="lg"
      centered
      size={480}
      styles={{ title: { fontWeight: 800, fontSize: 17, letterSpacing: '-.2px' } }}
      // Счётчик «за текущий сеанс»: после закрытия (когда анимация доиграла)
      // статусы сбрасываем, следующее открытие начинается с нуля.
      transitionProps={{ onExited: () => setRows([]) }}
    >
      <UploadDropzone
        multiple
        accept={MEDIA_LIBRARY_ACCEPT}
        maxSize={MEDIA_MAX_VIDEO_SIZE}
        title="Перетащите файлы сюда"
        hint={`или нажмите, чтобы выбрать · ${MEDIA_LIBRARY_FORMATS_LABEL}`}
        onDrop={handleDrop}
        onReject={handleReject}
      />

      {/* Пофайловые статусы текущего сеанса: лоадер на время «загрузки», затем галочка */}
      {rows.length > 0 ? (
        <Stack gap={6} mt={12}>
          {rows.map((row) => (
            <Group key={row.key} gap={8} wrap="nowrap">
              {row.status === 'uploading' ? (
                <Loader size={14} />
              ) : (
                <IconCheck size={15} stroke={2.6} color="var(--mantine-color-success-6)" />
              )}
              <Text fz={12.5} lineClamp={1} style={{ flex: 1 }}>
                {row.name}
              </Text>
              <Text fz={11.5} c="dimmed">
                {row.status === 'uploading' ? 'загрузка…' : 'готово'}
              </Text>
            </Group>
          ))}
        </Stack>
      ) : null}

      {/* Счётчик сеанса с правильным склонением: 1 файл, 2 файла, 5 файлов */}
      {doneCount > 0 ? (
        <Text mt={12} fz={12.5} fw={600} c="success.7">
          ✓ Загружено в этой сессии: {doneCount} {pluralizeRu(doneCount, FILE_PLURAL_FORMS)}
        </Text>
      ) : null}

      <Button fullWidth mt="md" color="brand" radius="md" onClick={handleDone}>
        Готово
      </Button>
    </Modal>
  )
}
