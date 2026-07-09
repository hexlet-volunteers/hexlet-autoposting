import { useDispatch, useSelector } from 'react-redux'
import { closeAuth, openAuth, selectAuthModal, setAuthMode, setOauthError } from './authModalSlice'
import type { AuthMode } from './authModalSlice'

/** Управление auth-модалкой: открыть в нужном режиме / закрыть / сменить режим. */
export function useAuthModal() {
  const dispatch = useDispatch()
  const { opened, mode, oauthError } = useSelector(selectAuthModal)
  return {
    opened,
    mode,
    oauthError,
    open: (m?: AuthMode) => dispatch(openAuth(m)),
    close: () => dispatch(closeAuth()),
    setMode: (m: AuthMode) => dispatch(setAuthMode(m)),
    clearOauthError: () => dispatch(setOauthError(null)),
  }
}
