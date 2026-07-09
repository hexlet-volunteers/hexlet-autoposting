import type { QueryClient } from '@tanstack/react-query'
import { scheduledPostKeys } from '@/entities/scheduled-post'
import type { Post } from '@/entities/scheduled-post'
import { setUsage } from '@/entities/subscription'

/**
 * Пересчитывает счётчик запланированных постов в моке подписки после мутаций,
 * чтобы PlanWidget в сайдбаре сразу показывал актуальное «N из M».
 */
export function syncScheduledPostsUsage(queryClient: QueryClient) {
  const posts = queryClient.getQueryData<Post[]>(scheduledPostKeys.all) ?? []
  const scheduled = posts.filter((post) => post.status === 'scheduled').length
  setUsage(queryClient, { scheduledPosts: scheduled })
}
