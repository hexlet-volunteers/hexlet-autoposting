/** Одна строка отчёта — агрегированные метрики по площадке за период. */
export interface ReportRow {
  /** id площадки из shared/config/networks (vk, tg, ok, max, dzen, rutube, youtube). */
  networkId: string
  publications: number
  views: number
  /** Переходы по ссылкам (клики). */
  clicks: number
}

/** Масштаб отчёта (кнопки-фильтры из макета «Отчёты»). */
export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year'

/** Год отчёта (селектор из макета). */
export type ReportYear = '2026' | '2025' | '2024'
