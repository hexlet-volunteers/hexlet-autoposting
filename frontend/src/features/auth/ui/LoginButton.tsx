import { Button } from '@mantine/core'
import { IconBrandGoogle } from '@tabler/icons-react'
import { env } from '@/shared/config/env'

/**
 * Kicks off Google OAuth by navigating to the backend's auth entrypoint.
 * The exact path is finalized in backlog #60; `/auth/google` is the assumed route.
 */
export function LoginButton() {
  const handleLogin = () => {
    window.location.href = `${env.apiUrl}/auth/google`
  }
  return (
    <Button leftSection={<IconBrandGoogle size={18} />} onClick={handleLogin} size="md">
      Войти через Google
    </Button>
  )
}
