import { Button } from '@mantine/core'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { ErrorScreen } from '@/shared/ui'

const COPY: Record<number, { title: string; description: string }> = {
  404: {
    title: 'Такой страницы нет',
    description: 'Возможно, ссылка устарела или в адресе опечатка. Вернёмся на главную — там всё на месте.',
  },
  503: {
    title: 'Идут технические работы',
    description: 'Сервис временно недоступен — мы проводим обновление. Загляните чуть позже.',
  },
  500: {
    title: 'Что-то пошло не так',
    description: 'На нашей стороне произошла ошибка. Мы уже разбираемся — попробуйте обновить страницу или вернитесь на главную.',
  },
}

/** Глобальный обработчик ошибок роутинга (react-router errorElement): 404 / 503 / 500. */
export function RouteErrorPage() {
  const error = useRouteError()
  const status = isRouteErrorResponse(error) ? error.status : 500
  const code = status in COPY ? status : 500
  const { title, description } = COPY[code]

  return (
    <ErrorScreen
      code={String(code)}
      title={title}
      description={description}
      action={
        <>
          <Button component={Link} to="/" size="md">
            На главную
          </Button>
          {code !== 404 && (
            <Button variant="default" size="md" onClick={() => window.location.reload()}>
              Обновить
            </Button>
          )}
        </>
      }
    />
  )
}
