import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { deletePlatformRequest, platformKeys } from '@/entities/platform'

export function useDeletePlatform() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, id }: { userId: number; id: number }) =>
      deletePlatformRequest(userId, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.all })
      notifications.show({ color: 'green', message: 'Платформа удалена' })
    },
    onError: (error: unknown) => {
      notifications.show({
        color: 'red',
        title: 'Не удалось удалить платформу',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      })
    },
  })
}
