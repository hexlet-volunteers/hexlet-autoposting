import type { ReportRow } from './types'

/**
 * Базовые демо-метрики за неделю по подключённым площадкам.
 * Значения из макета «Отчёты» (data-screen-label="Кабинет: контент").
 * likes/reposts добавлены к publications/views как правдоподобная демонстрация.
 *
 * TODO (Design First): заменить на реальные данные из
 * GET /projects/{id}/reports?period=&year= (эндпоинт появится в бэкенде).
 */
export const REPORT_ROWS_WEEK: ReportRow[] = [
  { networkId: 'vk', publications: 12, views: 8400, likes: 1240, reposts: 214 },
  { networkId: 'tg', publications: 10, views: 5900, likes: 760, reposts: 168 },
  { networkId: 'dzen', publications: 5, views: 7200, likes: 540, reposts: 305 },
  { networkId: 'youtube', publications: 3, views: 3800, likes: 410, reposts: 96 },
  { networkId: 'ok', publications: 6, views: 2100, likes: 190, reposts: 44 },
  { networkId: 'max', publications: 4, views: 1300, likes: 120, reposts: 21 },
  { networkId: 'rutube', publications: 2, views: 950, likes: 70, reposts: 12 },
]

/** Множитель длины периода относительно недели (из макета: REP_MULT). */
export const PERIOD_MULTIPLIER: Record<string, number> = {
  week: 1,
  month: 4,
  quarter: 13,
  year: 52,
}

/** Коэффициент года относительно 2026 (из макета: YEAR_K). */
export const YEAR_MULTIPLIER: Record<string, number> = {
  '2026': 1,
  '2025': 0.8,
}
