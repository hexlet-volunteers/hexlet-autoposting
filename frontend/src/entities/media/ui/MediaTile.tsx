import { UnstyledButton } from '@mantine/core'
import type { Media } from '../model/types'
import { PlayBadge } from './PlayBadge'
import classes from './MediaTile.module.css'

interface MediaTileProps {
  media: Media
  /** Клик по плитке — открыть предпросмотр. */
  onClick: () => void
}

/**
 * Плитка медиатеки по макету (app-dashboard.html): кремовая плитка с пунктирной
 * рамкой и именем файла по центру; для видео — круглый play над именем.
 * Hover: рамка и текст синеют (brand). Без иконок и метаданных.
 */
export function MediaTile({ media, onClick }: MediaTileProps) {
  return (
    <UnstyledButton className={classes.tile} onClick={onClick} title={media.name}>
      {media.kind === 'video' ? <PlayBadge /> : null}
      <span className={classes.name}>{media.name}</span>
    </UnstyledButton>
  )
}
