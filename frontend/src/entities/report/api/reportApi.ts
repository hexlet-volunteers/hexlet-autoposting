import {
  PERIOD_MULTIPLIER,
  REPORT_DELAY_MS,
  REPORT_ROWS_WEEK,
  SIMULATE_REPORT_ERROR,
  YEAR_MULTIPLIER,
} from '../model/mock'
import type { ReportRow } from '../model/types'

export const reportKeys = {
  all: ['report'] as const,
  byFilter: (period: string, year: string) => ['report', period, year] as const,
}

/**
 * Мок-загрузка отчёта по площадкам за выбранный период и год.
 *
 * Недельные значения масштабируются множителем периода и коэффициентом года
 * (как в макете). Задержка эмулирует сеть, чтобы лоадер был реально виден.
 *
 * TODO (Design First): заменить на GET /projects/{id}/reports?period=&year=
 * (эндпоинт появится в бэкенде, см. #147).
 */
export async function fetchReport(period: string, year: string): Promise<ReportRow[]> {
  await new Promise((resolve) => setTimeout(resolve, REPORT_DELAY_MS))

  if (SIMULATE_REPORT_ERROR) {
    throw new Error('Не удалось загрузить отчёт')
  }

  const mult = (PERIOD_MULTIPLIER[period] ?? 1) * (YEAR_MULTIPLIER[year] ?? 1)
  return REPORT_ROWS_WEEK.map((row) => ({
    networkId: row.networkId,
    publications: Math.round(row.publications * mult),
    views: Math.round(row.views * mult),
    clicks: Math.round(row.clicks * mult),
  }))
}
