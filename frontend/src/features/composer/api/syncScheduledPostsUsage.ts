import type { QueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { scheduledPostKeys } from '@/entities/scheduled-post'
import type { Post } from '@/entities/scheduled-post'
import { setUsage, subscriptionKeys } from '@/entities/subscription'
import type { Subscription } from '@/entities/subscription'

/**
 * Пересчитывает счётчик запланированных постов в моке подписки после мутаций,
 * чтобы PlanWidget в сайдбаре сразу показывал актуальное «N из M».
 * Мягкий enforcement (#211): в момент исчерпания квоты показываем уведомление —
 * призыв к апгрейду (кнопка «Улучшить тариф») живёт в баннере и виджете тарифа.
 */
export function syncScheduledPostsUsage(queryClient: QueryClient) {
  const posts = queryClient.getQueryData<Post[]>(scheduledPostKeys.all) ?? []
  const scheduled = posts.filter((post) => post.status === 'scheduled').length

  const before = queryClient.getQueryData<Subscription>(subscriptionKeys.all)
  setUsage(queryClient, { scheduledPosts: scheduled })

  // Уведомляем один раз — когда мутация пересекла границу лимита (не был исчерпан → исчерпан)
  const limit = before?.limits.scheduledPosts ?? Infinity
  const wasExhausted = (before?.usage.scheduledPosts ?? 0) >= limit
  const nowExhausted = Number.isFinite(limit) && scheduled >= limit
  if (nowExhausted && !wasExhausted) {
    notifications.show({
      color: 'orange',
      title: 'Достигнут лимит тарифа',
      message: `Запланировано ${scheduled} из ${limit} постов в месяц — улучшите тариф, чтобы планировать больше.`,
    })
  }
}
