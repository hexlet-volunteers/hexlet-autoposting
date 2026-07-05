import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { createPlatformRequest, platformKeys } from '@/entities/platform'
import type { CreatePlatformRequestDto } from '@/entities/platform'

export function useCreatePlatform() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePlatformRequestDto) => createPlatformRequest(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.all })
      notifications.show({ color: 'green', message: 'Платформа добавлена' })
    },
    onError: (error: unknown) => {
      notifications.show({
        color: 'red',
        title: 'Не удалось добавить платформу',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      })
    },
  })
}
