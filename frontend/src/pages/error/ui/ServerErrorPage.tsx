import { Button } from '@mantine/core'
import { Link } from 'react-router-dom'
import { ErrorScreen } from '@/shared/ui'

/** 500 — внутренняя ошибка сервера. */
export function ServerErrorPage() {
  return (
    <ErrorScreen
      code="500"
      title="Что-то пошло не так"
      description="На нашей стороне произошла ошибка. Мы уже разбираемся — попробуйте обновить страницу или вернитесь на главную."
      action={
        <>
          <Button component={Link} to="/" size="md">
            На главную
          </Button>
          <Button variant="default" size="md" onClick={() => window.location.reload()}>
            Обновить
          </Button>
        </>
      }
    />
  )
}
