import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { isInWeek, startOfWeekMonday } from '../lib/week'
import type { Post } from '../model/types'

export const scheduledPostKeys = {
  all: ['scheduled-posts'] as const,
}

/**
 * Понедельник текущей недели (00:00): контент-план всегда показывает
 * «живую» неделю относительно сегодняшнего дня.
 */
const weekStart = startOfWeekMonday(dayjs())

/** Хелпер: ISO-дата на N-й день текущей недели в заданное время. */
function at(dayOffset: number, hour: number, minute = 0): string {
  return weekStart.add(dayOffset, 'day').hour(hour).minute(minute).toISOString()
}

// TODO (Design First, backlog #117): заменить мок на GET /projects/{id}/posts (oapi-codegen хук).
// Текущая неделя собрана вручную — это «витрина» недельного вида.
const CURRENT_WEEK: Post[] = [
  {
    id: 'sp1',
    title: 'Анонс осенней коллекции',
    text: 'Осень уже здесь — встречайте новую коллекцию. Мягкие ткани, тёплые цвета и свободные силуэты.',
    networkIds: ['vk', 'tg', 'ok'],
    scheduledAt: at(0, 10, 0),
    status: 'scheduled',
    mediaCount: 3,
  },
  {
    id: 'sp2',
    title: 'Рубрика «Вопрос-ответ»',
    text: 'Собрали ваши вопросы из директа и отвечаем на самые частые. Пишите новые в комментариях.',
    networkIds: ['tg'],
    scheduledAt: at(0, 18, 30),
    status: 'scheduled',
    isRecurring: true,
  },
  {
    id: 'sp3',
    title: 'Как мы выбираем поставщиков',
    text: 'Показываем закулисье: от первого созвона с фабрикой до готового изделия на складе.',
    networkIds: ['dzen', 'vk'],
    scheduledAt: at(1, 12, 0),
    status: 'scheduled',
    mediaCount: 1,
  },
  {
    id: 'sp4',
    title: 'Скидка 20% на первый заказ',
    text: 'До конца недели дарим новым подписчикам скидку 20%. Промокод в закреплённом сообщении.',
    networkIds: ['vk', 'tg', 'ok', 'max'],
    scheduledAt: at(2, 11, 0),
    status: 'scheduled',
    mediaCount: 2,
  },
  {
    id: 'sp5',
    title: 'Видео: собираем капсульный гардероб',
    text: 'Пять базовых вещей и десять образов на их основе. Ссылка на полное видео — в описании.',
    networkIds: ['rutube', 'youtube'],
    scheduledAt: at(3, 15, 0),
    status: 'scheduled',
    mediaCount: 1,
  },
  {
    id: 'sp6',
    title: 'Отзыв клиента недели',
    text: 'Марина рассказала, как носит наше пальто уже третий сезон. Спасибо за доверие!',
    networkIds: ['ok', 'vk'],
    scheduledAt: at(4, 13, 30),
    status: 'scheduled',
  },
  {
    id: 'sp7',
    title: 'Гайд по уходу за шерстью',
    text: 'Как стирать, сушить и хранить шерстяные вещи, чтобы они служили годами.',
    networkIds: ['dzen'],
    scheduledAt: at(5, 10, 0),
    status: 'draft',
  },
  {
    id: 'sp8',
    title: 'Подборка образов на выходные',
    text: 'Три комплекта на прогулку, встречу с друзьями и уютный вечер дома.',
    networkIds: ['tg', 'max'],
    scheduledAt: at(6, 17, 0),
    status: 'scheduled',
    mediaCount: 4,
    isRecurring: true,
  },
  // ——— Отправленные (архив) — с метриками для «Статистики поста» ———
  {
    id: 'sp-sent-1',
    title: 'Итоги распродажи',
    text: 'Спасибо, что были с нами! За три дня распродажи вы оформили более 400 заказов.',
    networkIds: ['vk', 'tg'],
    scheduledAt: weekStart.subtract(2, 'day').hour(12).toISOString(),
    status: 'sent',
    mediaCount: 1,
    metrics: { views: 12400, likes: 318, reposts: 47, comments: 63, clicks: 342 },
  },
  {
    id: 'sp-sent-2',
    title: 'Знакомство с командой',
    text: 'Рассказываем, кто стоит за брендом: дизайнеры, технологи и служба заботы.',
    networkIds: ['tg'],
    scheduledAt: weekStart.subtract(3, 'day').hour(16).toISOString(),
    status: 'sent',
    metrics: { views: 8730, likes: 402, reposts: 12, comments: 88, clicks: 261 },
  },
  {
    id: 'sp-sent-3',
    title: 'Новая точка выдачи',
    text: 'Открыли пункт самовывоза в центре города. Адрес и часы работы — на карте.',
    networkIds: ['vk', 'ok'],
    scheduledAt: weekStart.subtract(5, 'day').hour(10).toISOString(),
    status: 'sent',
    mediaCount: 2,
    metrics: { views: 5210, likes: 156, reposts: 9, comments: 21, clicks: 148 },
  },
  {
    id: 'sp-sent-4',
    title: 'Прямой эфир: разбор трендов',
    text: 'Запись прошедшего эфира уже доступна. Обсудили главные тренды сезона.',
    networkIds: ['youtube', 'rutube'],
    scheduledAt: weekStart.subtract(6, 'day').hour(19).toISOString(),
    status: 'sent',
    metrics: { views: 21800, likes: 940, reposts: 73, comments: 205, clicks: 517 },
  },
]

// ——— Генерация постов на прошлый и текущий год ———
// Масштабы «Месяц/Квартал/Год» должны выглядеть живыми: посты раскиданы по всем
// месяцам детерминированно (без Math.random) и относительно сегодняшнего дня.

const GEN_TITLES = [
  'Анонс акции',
  'Подборка советов',
  'Опрос подписчиков',
  'Дайджест недели',
  'Бэкстейдж съёмки',
  'Отзыв клиента',
  'Гайд по продукту',
  'Новинки ассортимента',
]
const GEN_TEXTS = [
  'Готовим для вас что-то особенное — подробности уже совсем скоро.',
  'Собрали практичные советы, которые пригодятся каждому подписчику.',
  'Делимся закулисьем и отвечаем на вопросы из комментариев.',
  'Коротко о главном за неделю: новинки, планы и приятные мелочи.',
]
const GEN_NETS: string[][] = [
  ['vk'],
  ['tg'],
  ['vk', 'tg'],
  ['ok'],
  ['dzen'],
  ['tg', 'max'],
  ['rutube'],
  ['youtube'],
  ['vk', 'ok'],
]
const GEN_HOURS = [9, 11, 13, 15, 17, 19]

// Сколько постов приходится на каждый месяц (индекс = номер месяца):
// разные значения дают барчикам вида «Год» разную высоту.
const PLAN_THIS_YEAR = [6, 9, 12, 7, 10, 8, 11, 9, 7, 12, 8, 10]
const PLAN_PREV_YEAR = [3, 4, 6, 5, 7, 4, 6, 8, 5, 7, 6, 5]

/** Метрики «опубликованного» поста — детерминированная псевдослучайность от индекса. */
function metricsFor(seq: number): Post['metrics'] {
  const views = 900 + ((seq * 137) % 9000)
  return {
    views,
    likes: 40 + ((seq * 17) % 400),
    reposts: 3 + (seq % 19),
    comments: 2 + (seq % 27),
    // Переходы — ~2–6% просмотров, детерминированно от индекса (без Math.random).
    clicks: Math.round(views * (0.02 + (seq % 41) / 1000)),
  }
}

/** Посты одного года по помесячному плану. Текущую неделю пропускаем — она собрана вручную. */
function generateYear(year: number, plan: number[]): Post[] {
  const now = dayjs()
  const posts: Post[] = []
  plan.forEach((count, month) => {
    // Сначала startOf('year') (1-е число), иначе month() 31-го числа перескочит месяц
    const monthStart = dayjs().startOf('year').year(year).month(month)
    const daysInMonth = monthStart.daysInMonth()
    for (let i = 0; i < count; i += 1) {
      const seq = month * 31 + i
      const day = 1 + ((seq * 11 + i * 5) % daysInMonth)
      const date = monthStart
        .date(day)
        .hour(GEN_HOURS[seq % GEN_HOURS.length])
        .minute(i % 2 === 0 ? 0 : 30)
      if (isInWeek(date, weekStart)) continue
      const sent = date.isBefore(now)
      posts.push({
        id: `gen-${year}-${month + 1}-${i}`,
        title: GEN_TITLES[seq % GEN_TITLES.length],
        text: GEN_TEXTS[seq % GEN_TEXTS.length],
        networkIds: GEN_NETS[seq % GEN_NETS.length],
        scheduledAt: date.toISOString(),
        status: sent ? 'sent' : 'scheduled',
        ...(seq % 3 === 0 ? { mediaCount: (seq % 4) + 1 } : {}),
        ...(sent ? { metrics: metricsFor(seq) } : {}),
      })
    }
  })
  return posts
}

/** Насыщенный день текущего месяца (>3 постов) — чтобы месяц показывал «+N». */
function generateBusyDay(): Post[] {
  const monthStart = dayjs().startOf('month')
  // Кандидаты отстоят друг от друга на 3 недели — в текущую неделю попадёт максимум один
  let busyDay = monthStart.add(2, 'day')
  if (isInWeek(busyDay, weekStart)) busyDay = monthStart.add(23, 'day')
  const now = dayjs()
  return Array.from({ length: 5 }, (_, i) => {
    const date = busyDay.hour(9 + i * 2).minute(0)
    const sent = date.isBefore(now)
    return {
      id: `busy-${i}`,
      title: GEN_TITLES[(i + 2) % GEN_TITLES.length],
      text: GEN_TEXTS[i % GEN_TEXTS.length],
      networkIds: GEN_NETS[(i * 2) % GEN_NETS.length],
      scheduledAt: date.toISOString(),
      status: sent ? 'sent' : 'scheduled',
      ...(sent ? { metrics: metricsFor(i + 50) } : {}),
    } satisfies Post
  })
}

const SEED: Post[] = [
  ...CURRENT_WEEK,
  ...generateYear(dayjs().year(), PLAN_THIS_YEAR),
  ...generateYear(dayjs().year() - 1, PLAN_PREV_YEAR),
  ...generateBusyDay(),
]

function usePostsQuery() {
  return useQuery({
    queryKey: scheduledPostKeys.all,
    queryFn: async (): Promise<Post[]> => {
      // Эмуляция сетевой задержки, чтобы isLoading было видно скелетонами (как в entities/media).
      await new Promise((resolve) => setTimeout(resolve, 400))
      return SEED
    },
    staleTime: Infinity,
  })
}

/**
 * Контент-план: посты всех статусов за оба года.
 * Виды «Неделя/Месяц/Квартал/Год» сами режут список по датам и статусам.
 */
export function useContentPlan(): { data: Post[]; isLoading: boolean } {
  const { data, isLoading } = usePostsQuery()
  return { data: data ?? [], isLoading }
}

/** Очередь: ближайшие публикации и архив отправленных. */
export function useQueue(): { upcoming: Post[]; sent: Post[]; isLoading: boolean } {
  const { data = [], isLoading } = usePostsQuery()
  const upcoming = data
    .filter((p) => p.status === 'scheduled')
    .sort((a, b) => dayjs(a.scheduledAt).valueOf() - dayjs(b.scheduledAt).valueOf())
  const sent = data
    .filter((p) => p.status === 'sent')
    .sort((a, b) => dayjs(b.scheduledAt).valueOf() - dayjs(a.scheduledAt).valueOf())
  return { upcoming, sent, isLoading }
}

/** Один пост по id (для композера и статистики). */
export function usePost(id: string | undefined): Post | undefined {
  const { data } = usePostsQuery()
  if (!id) return undefined
  return data?.find((p) => p.id === id)
}
