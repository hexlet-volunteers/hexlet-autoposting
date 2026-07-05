import { Button } from '@mantine/core'
import { Link } from 'react-router-dom'
import { ErrorScreen } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <ErrorScreen
      code="404"
      title="Такой страницы нет"
      description="Возможно, ссылка устарела или в адресе опечатка. Вернёмся на главную — там всё на месте."
      action={
        <Button component={Link} to="/" size="md">
          На главную
        </Button>
      }
    />
  )
}
