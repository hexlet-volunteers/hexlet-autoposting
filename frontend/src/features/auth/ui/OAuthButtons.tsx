import type { CSSProperties } from 'react'
import { Button, SimpleGrid } from '@mantine/core'
import { OAUTH_PROVIDERS } from '../model/oauthProviders'
import classes from './OAuthButtons.module.css'

/** Сетка 3×2 кнопок быстрого входа через сервисы (макет login.html). */
export function OAuthButtons() {
  return (
    <SimpleGrid cols={3} spacing={8}>
      {OAUTH_PROVIDERS.map((p) => (
        <Button
          key={p.id}
          size="xs"
          radius={10}
          fw={600}
          className={classes.provider}
          styles={{ root: { background: p.color, color: p.fg } }}
          // Сила hover-затемнения — CSS-переменной (см. OAuthButtons.module.css)
          style={{ '--oauth-hover-brightness': String(p.hoverBrightness) } as CSSProperties}
          onClick={() => {
            // TODO(#111): реальный OAuth — полный редирект на бэкенд:
            // window.location.assign(`${env.apiUrl}/auth/${p.id}/authorize`).
            // Бэкенда пока нет, поэтому мок: «провайдер» мгновенно возвращает
            // пользователя на наш callback с кодом (обработка — pages/auth-callback).
            window.location.assign(
              `/auth/callback?provider=${p.id}&code=mock-code&state=mock-state`,
            )
          }}
        >
          {p.label}
        </Button>
      ))}
    </SimpleGrid>
  )
}
