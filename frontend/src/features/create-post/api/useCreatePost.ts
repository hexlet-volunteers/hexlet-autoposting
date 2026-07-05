import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { createPostRequest, postKeys } from '@/entities/post'
import type { CreatePostRequestDto } from '@/entities/post'

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePostRequestDto) => createPostRequest(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postKeys.all })
      notifications.show({ color: 'green', message: 'Пост создан' })
    },
    onError: (error: unknown) => {
      notifications.show({
        color: 'red',
        title: 'Не удалось создать пост',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      })
    },
  })
}
