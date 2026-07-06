/**
 * Доменная модель поста продукта «Отложка» (контент-план + очередь).
 *
 * ВАЖНО: это НОВЫЙ доменный слой для контент-плана/очереди. Он намеренно
 * лежит в entities/scheduled-post, чтобы не конфликтовать со старым
 * минимальным entities/post, который используется легаси-кодом.
 */

export type PostStatus = 'draft' | 'scheduled' | 'sent' | 'failed'

/** Метрики опубликованного поста (для экрана «Статистика поста»). */
export interface PostMetrics {
  views: number
  likes: number
  reposts: number
  comments: number
}

export interface Post {
  id: string
  title: string
  text: string
  /** id площадок из NETWORKS (@/shared/config/networks). */
  networkIds: string[]
  /** ISO-дата запланированной/фактической публикации. */
  scheduledAt: string
  status: PostStatus
  /** Кол-во прикреплённых медиа (фото/видео). */
  mediaCount?: number
  /** Метрики доступны только у отправленных постов. */
  metrics?: PostMetrics
}
