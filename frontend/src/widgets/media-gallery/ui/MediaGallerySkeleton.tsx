import { Box, SimpleGrid, Skeleton, Stack } from '@mantine/core'

/** Скелетон одной плитки: превью 4/3 плюс две строки под имя и метаданные. */
function TileSkeleton() {
  return (
    <Stack gap={6}>
      <Skeleton radius={12} style={{ aspectRatio: '4 / 3', height: 'auto' }} />
      <Skeleton h={12} w="70%" radius="sm" />
      <Skeleton h={10} w="50%" radius="sm" />
    </Stack>
  )
}

/** Сетка скелетонов на время загрузки — каркас повторяет секции «Фото» и «Видео». */
export function MediaGallerySkeleton() {
  return (
    <Box>
      <Skeleton h={12} w={46} radius="sm" />
      <SimpleGrid mt="xs" cols={{ base: 2, sm: 3, md: 4 }} spacing={12}>
        {Array.from({ length: 4 }, (_, i) => (
          <TileSkeleton key={`photo-${i}`} />
        ))}
      </SimpleGrid>

      <Skeleton mt={18} h={12} w={54} radius="sm" />
      <SimpleGrid mt="xs" cols={{ base: 2, sm: 3, md: 4 }} spacing={12}>
        {Array.from({ length: 2 }, (_, i) => (
          <TileSkeleton key={`video-${i}`} />
        ))}
      </SimpleGrid>
    </Box>
  )
}
