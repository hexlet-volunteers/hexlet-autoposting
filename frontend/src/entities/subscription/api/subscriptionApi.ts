import { useQuery } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import type { Subscription } from '../model/types'

export const subscriptionKeys = {
  all: ['subscription'] as const,
}

// TODO (Design First): заменить мок на GET /billing/subscription (oapi-codegen хук).
// usage.scheduledPosts согласован с моками entities/scheduled-post (7 постов со статусом scheduled).
const SEED: Subscription = {
  plan: 'Бесплатный',
  renewsAt: '2026-12-12',
  limits: { aiRequests: 50, scheduledPosts: 10 },
  usage: { aiRequests: 5, scheduledPosts: 7 },
}

export function useSubscription() {
  return useQuery({
    queryKey: subscriptionKeys.all,
    queryFn: async (): Promise<Subscription> => SEED,
    // Отдаём синхронно, чтобы квоты были доступны на первом рендере (сайдбар, композер).
    initialData: SEED,
    staleTime: Infinity,
  })
}

/**
 * Демо-мутатор: +1 использованная ИИ-генерация.
 * Вызывать из обработчиков генерации (композер, панель ИИ) с queryClient из useQueryClient().
 */
export function incrementAiUsage(queryClient: QueryClient) {
  queryClient.setQueryData<Subscription>(subscriptionKeys.all, (old = SEED) => ({
    ...old,
    usage: { ...old.usage, aiRequests: old.usage.aiRequests + 1 },
  }))
}

/** Демо-мутатор: частично переписать usage (например, счётчик запланированных постов). */
export function setUsage(queryClient: QueryClient, patch: Partial<Subscription['usage']>) {
  queryClient.setQueryData<Subscription>(subscriptionKeys.all, (old = SEED) => ({
    ...old,
    usage: { ...old.usage, ...patch },
  }))
}
