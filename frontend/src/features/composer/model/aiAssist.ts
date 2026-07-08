/**
 * Мок-модель ИИ-помощника композера (сегмент features/composer: панель нельзя
 * выносить в соседнюю фичу — steiger запрещает импорт фичи из фичи).
 * Бэкенда нет: генерация эмулируется задержкой, варианты — тексты из макета
 * app-dashboard.html (массив this.AI), слегка варьируемые выбранным тоном.
 * TODO (Design First): заменить на POST /api/ai/suggest.
 */

/** Модели ИИ-помощника — из макета «Композер». */
export const AI_MODELS = ['YandexGPT 5 Pro', 'GigaChat Max', 'Claude Haiku', 'DeepSeek V3']

/** Фиолетовый акцент панели ИИ — из макета app-dashboard. */
export const AI_ACCENT = '#6E5BFF'

export const AI_TONES = ['Дружелюбный', 'Деловой', 'Продающий', 'Экспертный'] as const
export type AiTone = (typeof AI_TONES)[number]

export interface AiRequest {
  topic: string
  tone: AiTone
  /** Генерация «по фото»: мок-подпись к прикреплённому изображению. */
  byPhoto: boolean
}

// Базовые тексты из макета app-dashboard.html (this.AI)
const BASE_TEXTS = [
  'Открываем запись на декабрь! Успейте забронировать любимое время — в прошлом месяце окошки закончились за три дня.',
  'Секрет идеального капучино — молоко 3,2% и ровно 55 градусов. Приходите, покажем. И нальём.',
  'Итоги недели: 4 новых вкуса, 120 довольных гостей и один очень счастливый бариста.',
  'Совет дня: планируйте посты с вечера — утром голова нужна для важных дел.',
]

// Мок-подписи к прикреплённому фото
const PHOTO_TEXTS = [
  'На фото — то, ради чего к нам приходят: свежая партия только из печи. Успейте, пока горячее!',
  'Поймали момент: так выглядит наш обычный день. Тепло, уютно и очень вкусно.',
  'Кадр из закулисья — показываем то, что обычно остаётся за кадром. Как вам?',
]

// Тональные обрамления вариантов — «влияние» выбранного тона на мок-генерацию
const TONE_DECOR: Record<AiTone, { prefix: string; suffix: string }> = {
  Дружелюбный: { prefix: '', suffix: ' Заглядывайте — будем рады! 🙌' },
  Деловой: { prefix: 'Коротко о главном. ', suffix: '' },
  Продающий: { prefix: '', suffix: ' Успейте — предложение ограничено!' },
  Экспертный: { prefix: 'Разбираемся по делу: ', suffix: ' Сохраняйте, чтобы не потерять.' },
}

// Счётчик попыток: сдвигает набор вариантов и раз в три попытки даёт мок-ошибку,
// чтобы состояние «ошибка + повторить» было воспроизводимо без бэкенда.
let attempt = 0

/** Асинхронная мок-генерация: ~1.2 сек задержки, 3 варианта текста. */
export async function generateAiVariants({ topic, tone, byPhoto }: AiRequest): Promise<string[]> {
  attempt += 1
  await new Promise((resolve) => setTimeout(resolve, 1200))
  if (attempt % 3 === 0) {
    throw new Error('Сервис генерации не ответил — попробуйте ещё раз')
  }
  const source = byPhoto ? PHOTO_TEXTS : BASE_TEXTS
  const { prefix, suffix } = TONE_DECOR[tone]
  const theme = topic.trim()
  return Array.from({ length: 3 }, (_, index) => {
    const base = source[(attempt + index) % source.length]
    // Первый вариант начинаем с темы пользователя, если она задана
    const lead =
      theme && !byPhoto && index === 0 ? `${theme.charAt(0).toUpperCase()}${theme.slice(1)}: ` : ''
    return `${prefix}${lead}${base}${suffix}`
  })
}

/** Мок «ИИ-описания» для типа «Видео» (кнопка в блоке «Описание»). */
export function buildAiVideoDescription(): string {
  return (
    'В этом ролике — закулисье проекта: как всё устроено, кто за этим стоит ' +
    'и что попробовать в первую очередь. Подписывайтесь, чтобы не пропустить новые видео.'
  )
}
