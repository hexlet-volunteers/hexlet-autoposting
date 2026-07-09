import { useEffect } from 'react'
import { Center, Loader, Stack, Text } from '@mantine/core'
import { useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '@/entities/session'
import { mockExchangeOauthCode, OAUTH_PROVIDERS, setOauthError } from '@/features/auth'

/** Дефолтный текст ошибки, когда провайдер не прислал error_description */
const DEFAULT_OAUTH_ERROR = 'Не удалось войти через сервис, попробуйте ещё раз.'

/**
 * /auth/callback — лёгкий обработчик возврата с OAuth-провайдера.
 * Разбирает query (provider, code, state, error, error_description):
 * успех — мок-обмен кода на сессию и редирект в кабинет; ошибка — возврат
 * на /login с открытием auth-модалки и Alert с текстом ошибки.
 */
export function AuthCallbackPage() {
  const [params] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Название сервиса для текста лоадера («Входим через VK ID…»)
  const provider = params.get('provider')
  const providerLabel = OAUTH_PROVIDERS.find((p) => p.id === provider)?.label

  useEffect(() => {
    // Провайдер вернул ошибку (отказ пользователя, сбой и т.п.) — в кабинет
    // не пускаем: текст покажет Alert в модалке входа, которую откроет /login
    if (params.get('error') !== null) {
      dispatch(setOauthError(params.get('error_description') || DEFAULT_OAUTH_ERROR))
      navigate('/login', { replace: true })
      return
    }

    // Успех: «меняем» code на сессию мок-запросом и уводим в кабинет.
    // Реальные проверка code/state и httpOnly-кука — backend (#111, #147).
    let cancelled = false
    void mockExchangeOauthCode().then(() => {
      if (cancelled) return
      dispatch(login())
      navigate('/app/calendar', { replace: true })
    })
    return () => {
      cancelled = true
    }
  }, [dispatch, navigate, params])

  return (
    <Center mih="100dvh">
      <Stack align="center" gap="sm">
        <Loader />
        <Text c="dimmed" fz="sm">
          {providerLabel ? `Входим через ${providerLabel}…` : 'Завершаем вход…'}
        </Text>
      </Stack>
    </Center>
  )
}
