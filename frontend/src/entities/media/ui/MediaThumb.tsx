import { ThemeIcon } from '@mantine/core'
import { IconPhoto, IconVideo } from '@tabler/icons-react'
import type { Media } from '../model/types'

/** Иконка-заглушка миниатюры по типу медиа (пока нет реальных превью с бэкенда). */
export function MediaThumb({ kind, size = 34 }: { kind: Media['kind']; size?: number }) {
  const Icon = kind === 'video' ? IconVideo : IconPhoto
  return (
    <ThemeIcon variant="light" color="brand" size={size + 22} radius="md">
      <Icon size={size} stroke={1.6} />
    </ThemeIcon>
  )
}
