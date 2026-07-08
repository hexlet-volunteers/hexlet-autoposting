import { Navigate, Outlet } from 'react-router-dom'
import { selectIsAuthenticated } from '@/entities/session'
import { useAppSelector } from '../store/hooks'

/**
 * Гард приватных маршрутов /app/*: без сессии — редирект на /login
 * (deep-link, открывающий auth-модалку поверх главной).
 */
export function RequireAuth() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
