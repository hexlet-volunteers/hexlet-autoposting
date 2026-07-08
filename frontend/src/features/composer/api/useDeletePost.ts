import { useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { scheduledPostKeys } from '@/entities/scheduled-post'
import type { Post } from '@/entities/scheduled-post'
import { syncScheduledPostsUsage } from './syncScheduledPostsUsage'

/**
 * Клиентское удаление поста (заглушка): убираем пост из кэша ['scheduled-posts'].
 * TODO (Design First): DELETE /api/posts/{id}.
 */
export function useDeletePost() {
  const queryClient = useQueryClient()

  return (id: string) => {
    queryClient.setQueryData<Post[]>(scheduledPostKeys.all, (old = []) =>
      old.filter((post) => post.id !== id),
    )
    syncScheduledPostsUsage(queryClient)
    notifications.show({ color: 'green', message: 'Пост удалён (демо)' })
  }
}
