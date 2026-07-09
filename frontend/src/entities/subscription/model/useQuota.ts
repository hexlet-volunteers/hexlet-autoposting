import { useSubscription } from '../api/subscriptionApi'

/** Состояние квоты одного вида ресурса. Limit = Infinity означает безлимит. */
export interface QuotaState {
  used: number
  limit: number
  /** Безлимитный ресурс (limit = Infinity): счётчики и пороги не считаются. */
  unlimited: boolean
  /** Доля израсходованного, 0–100 — для прогресс-баров; 0 при безлимите. */
  percent: number
  /** Приближение к лимиту: израсходовано ≥ 80%, но лимит ещё не достигнут. */
  warning: boolean
  exhausted: boolean
}

/**
 * Квота по виду ресурса: ИИ-генерации ('ai') или запланированные посты ('posts').
 * Все пороги (предупреждение, исчерпание) считаются здесь, чтобы компоненты
 * (PlanWidget, композер, баннеры) опирались только на данные хука.
 */
export function useQuota(kind: 'ai' | 'posts'): QuotaState {
  const { data } = useSubscription()
  const used = kind === 'ai' ? data.usage.aiRequests : data.usage.scheduledPosts
  const limit = kind === 'ai' ? data.limits.aiRequests : data.limits.scheduledPosts
  // Безлимит (Infinity) исчерпать нельзя
  const unlimited = !Number.isFinite(limit)
  const percent = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const exhausted = !unlimited && used >= limit
  // Порог «скоро лимит» — с 80% расхода, в цветах виджета это orange
  const warning = !unlimited && !exhausted && percent >= 80
  return { used, limit, unlimited, percent, warning, exhausted }
}
