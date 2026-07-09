import { useQuery } from '@tanstack/react-query'
import { fetchReport, reportKeys } from '../api/reportApi'
import type { ReportRow } from './types'

/**
 * Отчёт по площадкам за выбранный период и год.
 *
 * Мок на react-query: данные приходят с задержкой (без initialData),
 * поэтому при первой отрисовке и при смене фильтров виден лоадер.
 *
 * TODO (Design First): заменить queryFn на react-query поверх
 * GET /projects/{id}/reports?period=&year= (эндпоинт появится в бэкенде).
 */
export function useReport(
  period: string,
  year: string,
): { data: ReportRow[]; isLoading: boolean; error: unknown } {
  const query = useQuery({
    queryKey: reportKeys.byFilter(period, year),
    queryFn: () => fetchReport(period, year),
    // Кэш не держим: при каждой смене периода/года лоадер снова виден (критерий приёмки).
    gcTime: 0,
  })

  // Сигнатура — надмножество прежней: data всегда массив, как раньше.
  return { data: query.data ?? [], isLoading: query.isLoading, error: query.error }
}
