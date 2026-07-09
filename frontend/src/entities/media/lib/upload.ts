import { makeMockPreviewUrl, VIDEO_PREVIEW_BG, VIDEO_PREVIEW_FG } from './preview'
import type { Media } from '../model/types'

const SIZE_UNITS = ['Б', 'КБ', 'МБ', 'ГБ'] as const

/** Человекочитаемый размер файла в стиле моков: «640 КБ», «1,8 МБ», «128 МБ». */
export function formatFileSize(bytes: number): string {
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  // До 10 показываем один знак после запятой («1,8 МБ»), дальше — целое («128 МБ»).
  const rounded = unit === 0 || value >= 10 ? Math.round(value) : Math.round(value * 10) / 10
  return `${String(rounded).replace('.', ',')} ${SIZE_UNITS[unit]}`
}

// Сквозной счётчик для уникальных id: Date.now() может совпасть у файлов одного дропа.
let uploadCounter = 0

/**
 * Собирает элемент медиатеки из выбранного пользователем файла (мок-уровень).
 * Для фото превью настоящее — через URL.createObjectURL, для видео —
 * SVG-заглушка «стоп-кадра», как у видео-моков.
 */
export function mediaFromFile(file: File): Media {
  const kind: Media['kind'] = file.type.startsWith('video/') ? 'video' : 'photo'
  uploadCounter += 1
  return {
    id: `upload-${Date.now()}-${uploadCounter}`,
    name: file.name,
    kind,
    sizeLabel: formatFileSize(file.size),
    url:
      kind === 'photo'
        ? URL.createObjectURL(file)
        : makeMockPreviewUrl(file.name, VIDEO_PREVIEW_BG, VIDEO_PREVIEW_FG),
    uploadedAt: new Date().toISOString(),
  }
}
