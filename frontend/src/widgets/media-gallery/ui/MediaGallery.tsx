import { Box, SimpleGrid, Text, UnstyledButton } from '@mantine/core'
import { MediaTile } from '@/entities/media'
import type { Media } from '@/entities/media'
import classes from './MediaGallery.module.css'

/** UPPERCASE-заголовок секции («ФОТО» / «ВИДЕО») по макету app-dashboard.html. */
function SectionLabel({ children, mt }: { children: string; mt?: number }) {
  return (
    <Text
      mt={mt}
      fz={12}
      fw={700}
      tt="uppercase"
      style={{ letterSpacing: '.5px', color: 'rgba(23,21,15,.5)' }}
    >
      {children}
    </Text>
  )
}

interface MediaGalleryProps {
  media: Media[]
  /** Клик по плитке — открыть предпросмотр. */
  onSelect: (media: Media) => void
  /** Клик по «+ Добавить» — открыть модалку загрузки. */
  onAdd: () => void
}

/** Сетка медиатеки: секции «Фото» и «Видео» плюс пунктирная плитка «+ Добавить». */
export function MediaGallery({ media, onSelect, onAdd }: MediaGalleryProps) {
  const photos = media.filter((m) => m.kind === 'photo')
  const videos = media.filter((m) => m.kind === 'video')

  return (
    <Box>
      <SectionLabel>Фото</SectionLabel>
      <SimpleGrid mt="xs" cols={{ base: 2, sm: 3, md: 4 }} spacing={12}>
        {photos.map((item) => (
          <MediaTile key={item.id} media={item} onClick={() => onSelect(item)} />
        ))}
        <UnstyledButton className={classes.addTile} onClick={onAdd}>
          + Добавить
        </UnstyledButton>
      </SimpleGrid>

      {videos.length > 0 ? (
        <>
          <SectionLabel mt={18}>Видео</SectionLabel>
          <SimpleGrid mt="xs" cols={{ base: 2, sm: 3, md: 4 }} spacing={12}>
            {videos.map((item) => (
              <MediaTile key={item.id} media={item} onClick={() => onSelect(item)} />
            ))}
          </SimpleGrid>
        </>
      ) : null}
    </Box>
  )
}
