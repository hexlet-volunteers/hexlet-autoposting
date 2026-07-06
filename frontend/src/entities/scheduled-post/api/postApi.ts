import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import type { Post } from '../model/types'

export const scheduledPostKeys = {
  all: ['scheduled-posts'] as const,
}

/**
 * Начало текущей недели (понедельник, 09:00), чтобы контент-план всегда
 * показывал «живую» неделю относительно сегодняшнего дня.
 */
const weekStart = dayjs().startOf('week').add(1, 'day').hour(9).minute(0).second(0).millisecond(0)

/** Хелпер: ISO-дата на N-й день недели в заданное время. */
function at(dayOffset: number, hour: number, minute = 0): string {
  return weekStart.add(dayOffset, 'day').hour(hour).minute(minute).toISOString()
}

// TODO (Design First, backlog #117): заменить мок на GET /projects/{id}/posts (oapi-codegen хук).
const SEED: Post[] = [
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
  },
  // ——— Отправленные (архив) — с метриками для «Статистики поста» ———
  {
    id: 'sp-sent-1',
    title: 'Итоги распродажи',
    text: 'Спасибо, что были с нами! За три дня распродажи вы оформили более 400 заказов.',
    networkIds: ['vk', 'tg'],
    scheduledAt: dayjs(weekStart).subtract(2, 'day').hour(12).toISOString(),
    status: 'sent',
    mediaCount: 1,
    metrics: { views: 12400, likes: 318, reposts: 47, comments: 63 },
  },
  {
    id: 'sp-sent-2',
    title: 'Знакомство с командой',
    text: 'Рассказываем, кто стоит за брендом: дизайнеры, технологи и служба заботы.',
    networkIds: ['tg'],
    scheduledAt: dayjs(weekStart).subtract(3, 'day').hour(16).toISOString(),
    status: 'sent',
    metrics: { views: 8730, likes: 402, reposts: 12, comments: 88 },
  },
  {
    id: 'sp-sent-3',
    title: 'Новая точка выдачи',
    text: 'Открыли пункт самовывоза в центре города. Адрес и часы работы — на карте.',
    networkIds: ['vk', 'ok'],
    scheduledAt: dayjs(weekStart).subtract(5, 'day').hour(10).toISOString(),
    status: 'sent',
    mediaCount: 2,
    metrics: { views: 5210, likes: 156, reposts: 9, comments: 21 },
  },
  {
    id: 'sp-sent-4',
    title: 'Прямой эфир: разбор трендов',
    text: 'Запись прошедшего эфира уже доступна. Обсудили главные тренды сезона.',
    networkIds: ['youtube', 'rutube'],
    scheduledAt: dayjs(weekStart).subtract(6, 'day').hour(19).toISOString(),
    status: 'sent',
    metrics: { views: 21800, likes: 940, reposts: 73, comments: 205 },
  },
]

function usePostsQuery() {
  return useQuery({
    queryKey: scheduledPostKeys.all,
    queryFn: async (): Promise<Post[]> => SEED,
    // Отдаём синхронно, чтобы данные были доступны на первом рендере (как в entities/project).
    initialData: SEED,
    staleTime: Infinity,
  })
}

/** Контент-план: все запланированные посты (черновики + запланированные) на неделю. */
export function useContentPlan(): { data: Post[] } {
  const { data } = usePostsQuery()
  const posts = data.filter((p) => p.status === 'scheduled' || p.status === 'draft')
  return { data: posts }
}

/** Очередь: ближайшие публикации и архив отправленных. */
export function useQueue(): { upcoming: Post[]; sent: Post[] } {
  const { data } = usePostsQuery()
  const upcoming = data
    .filter((p) => p.status === 'scheduled')
    .sort((a, b) => dayjs(a.scheduledAt).valueOf() - dayjs(b.scheduledAt).valueOf())
  const sent = data
    .filter((p) => p.status === 'sent')
    .sort((a, b) => dayjs(b.scheduledAt).valueOf() - dayjs(a.scheduledAt).valueOf())
  return { upcoming, sent }
}

/** Один пост по id (для композера и статистики). */
export function usePost(id: string | undefined): Post | undefined {
  const { data } = usePostsQuery()
  if (!id) return undefined
  return data.find((p) => p.id === id)
}
