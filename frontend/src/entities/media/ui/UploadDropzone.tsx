// Стили пакета подключаем здесь же: все точки входа дроп-зон проходят через этот компонент.
import '@mantine/dropzone/styles.css'
import { Text } from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import type { FileRejection } from '@mantine/dropzone'
import classes from './UploadDropzone.module.css'

interface UploadDropzoneProps {
  /** MIME-типы, которые зона принимает (константы в model/uploadConfig). */
  accept: string[]
  /** Максимальный размер файла в байтах (константы в model/uploadConfig). */
  maxSize: number
  /** Разрешён ли выбор нескольких файлов сразу. */
  multiple?: boolean
  /** Заголовок зоны: «Перетащите файлы сюда» / «Перетащите файл сюда». */
  title: string
  /** Подпись под заголовком: «или нажмите, чтобы выбрать · …». */
  hint: string
  /** Оверлей с лоадером на время мок-загрузки (блокирует повторный дроп). */
  loading?: boolean
  /** Файлы, прошедшие валидацию типа и размера. */
  onDrop: (files: File[]) => void
  /** Файлы, отклонённые клиентской валидацией accept/maxSize. */
  onReject?: (rejections: FileRejection[]) => void
}

/**
 * Общая дроп-зона загрузки медиа: drag-and-drop, клик-выбор и валидация
 * accept/maxSize из коробки (@mantine/dropzone). Используется модалками
 * «Загрузка в медиатеку» и «Загрузка файла».
 */
export function UploadDropzone({
  accept,
  maxSize,
  multiple = false,
  title,
  hint,
  loading,
  onDrop,
  onReject,
}: UploadDropzoneProps) {
  return (
    <Dropzone
      accept={accept}
      maxSize={maxSize}
      multiple={multiple}
      loading={loading}
      onDrop={onDrop}
      onReject={onReject}
      classNames={{ root: classes.root }}
    >
      <Text fz={13.5} fw={700} c="brand" ta="center">
        {title}
      </Text>
      <Text mt={4} fz={12} c="dimmed" ta="center">
        {hint}
      </Text>
    </Dropzone>
  )
}
