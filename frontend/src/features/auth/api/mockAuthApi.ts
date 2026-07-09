/**
 * Мок-API авторизации: бэкенда пока нет, поэтому «запросы» эмулируются
 * задержкой ~600мс. Ошибки триггерятся заранее заданными значениями (см.
 * константы ниже) — так можно вручную проверить состояния loading/error.
 * Реальные POST /auth/login, /auth/register, /auth/password-reset и
 * сгенерированный клиент — отдельные задачи (#110, #147).
 */

/** Задержка мок-запроса, мс */
const MOCK_DELAY_MS = 600

/** Пароль-триггер ошибки входа: `wrong` → «неверная почта или пароль» */
export const MOCK_WRONG_PASSWORD = 'wrong'

/** Email-триггер ошибки регистрации: почта «уже занята» */
export const MOCK_TAKEN_EMAIL = 'taken@example.ru'

/** Email-триггер ошибки сброса пароля: аккаунт «не найден» */
export const MOCK_UNKNOWN_EMAIL = 'unknown@example.ru'

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))

export interface LoginPayload {
  email: string
  password: string
  /** Значение чекбокса «Запомнить меня» — прокидывается уже сейчас, чтобы контракт был готов к реальному API */
  rememberMe: boolean
}

/** Мок POST /auth/login */
export async function mockLogin({ password }: LoginPayload): Promise<void> {
  await wait()
  if (password === MOCK_WRONG_PASSWORD) {
    throw new Error('Неверная почта или пароль. Проверьте данные и попробуйте ещё раз.')
  }
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

/** Мок POST /auth/register */
export async function mockRegister({ email }: RegisterPayload): Promise<void> {
  await wait()
  if (email === MOCK_TAKEN_EMAIL) {
    throw new Error('Эта почта уже зарегистрирована — попробуйте войти.')
  }
}

/** Мок POST /auth/password-reset */
export async function mockRequestPasswordReset(email: string): Promise<void> {
  await wait()
  if (email === MOCK_UNKNOWN_EMAIL) {
    throw new Error('Не нашли аккаунт с такой почтой. Проверьте адрес или зарегистрируйтесь.')
  }
}

/**
 * Мок обмена OAuth-кода на сессию (возврат провайдера на /auth/callback).
 * Реальные проверка code/state и httpOnly-кука — backend-задачи (#111, #147).
 */
export async function mockExchangeOauthCode(): Promise<void> {
  await wait()
}

/** Достаём текст ошибки из мок-запроса (на будущее — из ответа API) */
export function getAuthErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Что-то пошло не так. Попробуйте ещё раз.'
}
