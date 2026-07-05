import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { deletePostRequest, postKeys } from '@/entities/post'

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, id }: { userId: number; id: number }) => deletePostRequest(userId, id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postKeys.all })
      notifications.show({ color: 'green', message: 'Пост удалён' })
    },
    onError: (error: unknown) => {
      notifications.show({
        color: 'red',
        title: 'Не удалось удалить пост',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      })
    },
  })
}
