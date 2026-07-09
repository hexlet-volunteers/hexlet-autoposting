import { env } from '@/shared/config/env'

/**
 * Thin typed HTTP client.
 *
 * NOTE (Design First / temporary): this hand-written client is a bridge until the
 * OpenAPI contract lands (backlog M1). At that point it is replaced by the generated
 * client (`npm run generate:api`, see openapi-ts.config.ts) — feature/entity code should
 * depend only on the small `request` surface so the swap is transparent.
 *
 * Known contract quirk (backlog #45/#82): the current backend expects `id_user` in the
 * request BODY for GET/DELETE, which browsers cannot send on GET. We therefore pass
 * `id_user` (and any read params) as query params — the form the regenerated, corrected
 * backend will accept.
 */

export type QueryParams = Record<string, string | number | boolean | undefined>

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  query?: QueryParams
  signal?: AbortSignal
}

/** Error carrying the HTTP status and the backend's `{ error }` message when present. */
export class HttpError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

function buildUrl(path: string, query?: QueryParams): string {
  const base = env.apiUrl || ''
  const qs = new URLSearchParams()
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) qs.append(key, String(value))
    }
  }
  const suffix = qs.toString()
  return `${base}${path}${suffix ? `?${suffix}` : ''}`
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal } = options

  const res = await fetch(buildUrl(path, query), {
    method,
    signal,
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return undefined as T

  const text = await res.text()
  // Не-JSON ответ (HTML прокси-ошибки, обрыв соединения) не должен ронять клиент
  // сырым SyntaxError — приводим к предсказуемому HttpError.
  let data: unknown
  try {
    data = text ? JSON.parse(text) : undefined
  } catch {
    throw new HttpError(res.status, 'Некорректный ответ сервера')
  }

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
        ? data.error
        : `Запрос завершился ошибкой (${res.status})`
    throw new HttpError(res.status, message)
  }

  return data as T
}
