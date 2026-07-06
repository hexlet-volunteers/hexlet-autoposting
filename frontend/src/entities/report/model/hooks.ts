import { useMemo } from 'react'
import { PERIOD_MULTIPLIER, REPORT_ROWS_WEEK, YEAR_MULTIPLIER } from './mock'
import type { ReportRow } from './types'

/**
 * Отчёт по площадкам за выбранный период и год.
 *
 * Пока считает демо-цифры из локального мока: недельные значения
 * масштабируются множителем периода и коэффициентом года (как в макете).
 *
 * TODO (Design First): заменить на react-query поверх
 * GET /projects/{id}/reports?period=&year= (эндпоинт появится в бэкенде).
 */
export function useReport(period: string, year: string): { data: ReportRow[] } {
  const data = useMemo<ReportRow[]>(() => {
    const mult = (PERIOD_MULTIPLIER[period] ?? 1) * (YEAR_MULTIPLIER[year] ?? 1)
    return REPORT_ROWS_WEEK.map((row) => ({
      networkId: row.networkId,
      publications: Math.round(row.publications * mult),
      views: Math.round(row.views * mult),
      likes: Math.round(row.likes * mult),
      reposts: Math.round(row.reposts * mult),
    }))
  }, [period, year])

  return { data }
}
