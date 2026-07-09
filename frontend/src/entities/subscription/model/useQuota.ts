import { useSubscription } from '../api/subscriptionApi'

/** Состояние квоты одного вида ресурса. Limit = Infinity означает безлимит. */
export interface QuotaState {
  used: number
  limit: number
  exhausted: boolean
}

/** Квота по виду ресурса: ИИ-генерации ('ai') или запланированные посты ('posts'). */
export function useQuota(kind: 'ai' | 'posts'): QuotaState {
  const { data } = useSubscription()
  const used = kind === 'ai' ? data.usage.aiRequests : data.usage.scheduledPosts
  const limit = kind === 'ai' ? data.limits.aiRequests : data.limits.scheduledPosts
  // Безлимит (Infinity) исчерпать нельзя
  return { used, limit, exhausted: Number.isFinite(limit) && used >= limit }
}
