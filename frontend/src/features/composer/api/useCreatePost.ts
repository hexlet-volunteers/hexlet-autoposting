import { useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { scheduledPostKeys } from '@/entities/scheduled-post'
import type { Post } from '@/entities/scheduled-post'
import { syncScheduledPostsUsage } from './syncScheduledPostsUsage'

/** Данные нового поста: id и статус проставляет мутация. */
export type PostDraft = Omit<Post, 'id' | 'status'>

/**
 * Клиентское создание поста (заглушка, по образцу features/create-project):
 * добавляем пост в кэш ['scheduled-posts'], после чего useContentPlan/useQueue/usePost
 * перерисуются без перезагрузки страницы.
 * TODO (Design First): POST /api/posts.
 */
export function useCreatePost() {
  const queryClient = useQueryClient()

  return (draft: PostDraft): Post => {
    const post: Post = { id: `sp-${Date.now()}`, status: 'scheduled', ...draft }
    queryClient.setQueryData<Post[]>(scheduledPostKeys.all, (old = []) => [...old, post])
    syncScheduledPostsUsage(queryClient)
    notifications.show({ color: 'green', message: 'Пост добавлен в отложку (демо)' })
    return post
  }
}
