import { useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { scheduledPostKeys } from '@/entities/scheduled-post'
import type { Post } from '@/entities/scheduled-post'
import { syncScheduledPostsUsage } from './syncScheduledPostsUsage'

/**
 * Клиентское обновление поста (заглушка): правим пост в кэше ['scheduled-posts'],
 * календарь и очередь перерисовываются сразу.
 * TODO (Design First): PATCH /api/posts/{id}.
 */
export function useUpdatePost() {
  const queryClient = useQueryClient()

  return (id: string, patch: Partial<Omit<Post, 'id'>>) => {
    queryClient.setQueryData<Post[]>(scheduledPostKeys.all, (old = []) =>
      old.map((post) => (post.id === id ? { ...post, ...patch } : post)),
    )
    syncScheduledPostsUsage(queryClient)
    notifications.show({ color: 'green', message: 'Пост обновлён (демо)' })
  }
}
