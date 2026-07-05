import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { postKeys, updatePostRequest } from '@/entities/post'
import type { UpdatePostRequestDto } from '@/entities/post'

export function useUpdatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdatePostRequestDto }) =>
      updatePostRequest(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postKeys.all })
      notifications.show({ color: 'green', message: 'Пост обновлён' })
    },
    onError: (error: unknown) => {
      notifications.show({
        color: 'red',
        title: 'Не удалось обновить пост',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      })
    },
  })
}
