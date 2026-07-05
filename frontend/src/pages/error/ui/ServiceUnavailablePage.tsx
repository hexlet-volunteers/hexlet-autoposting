import { Button } from '@mantine/core'
import { ErrorScreen } from '@/shared/ui'

/** 503 — сервис временно недоступен (техработы / обслуживание). */
export function ServiceUnavailablePage() {
  return (
    <ErrorScreen
      code="503"
      title="Идут технические работы"
      description="Сервис временно недоступен — мы проводим обновление. Загляните чуть позже, обычно это занимает несколько минут."
      action={
        <Button size="md" onClick={() => window.location.reload()}>
          Обновить страницу
        </Button>
      }
    />
  )
}
