import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { openAuth } from '@/features/auth'

/**
 * /login — не отдельная страница, а deep-link: открывает auth-модалку (режим входа)
 * поверх главной. Вся авторизация живёт в модалке (features/auth).
 */
export function LoginPage() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(openAuth('login'))
  }, [dispatch])
  return <Navigate to="/" replace />
}
