/**
 * Подписка воркспейса: тариф и квоты периода.
 * Единый источник для сайдбара (PlanWidget), композера, панели ИИ и биллинга.
 */
export interface Subscription {
  /** Название тарифа («Бесплатный», «Старт», «Про», «Агентство»). */
  plan: string
  /** Дата окончания оплаченного периода (ISO-строка). */
  renewsAt: string
  /** Лимиты за период; Infinity = безлимит. */
  limits: {
    aiRequests: number
    scheduledPosts: number
  }
  /** Сколько уже использовано за период. */
  usage: {
    aiRequests: number
    scheduledPosts: number
  }
}
