import type { ReportRow } from './types'

/**
 * Базовые демо-метрики за неделю по подключённым площадкам.
 * Значения из макета «Отчёты» (data-screen-label="Кабинет: контент", REPORT).
 *
 * TODO (Design First): заменить на реальные данные из
 * GET /projects/{id}/reports?period=&year= (эндпоинт появится в бэкенде).
 */
export const REPORT_ROWS_WEEK: ReportRow[] = [
  { networkId: 'vk', publications: 12, views: 8400, clicks: 214 },
  { networkId: 'tg', publications: 10, views: 5900, clicks: 168 },
  { networkId: 'dzen', publications: 5, views: 7200, clicks: 305 },
  { networkId: 'youtube', publications: 3, views: 3800, clicks: 96 },
  { networkId: 'ok', publications: 6, views: 2100, clicks: 44 },
  { networkId: 'max', publications: 4, views: 1300, clicks: 21 },
  { networkId: 'rutube', publications: 2, views: 950, clicks: 12 },
]

/** Имитация сетевой задержки мок-загрузки отчёта, мс. */
export const REPORT_DELAY_MS = 500

/**
 * Флаг для проверки состояния ошибки: поставьте true — и вместо таблицы
 * страница покажет сообщение об ошибке (QueryState). В демо всегда false.
 */
export const SIMULATE_REPORT_ERROR = false

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
  '2024': 0.62,
}
