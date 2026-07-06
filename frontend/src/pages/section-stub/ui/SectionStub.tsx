import { Stack, Title } from '@mantine/core'
import { EmptyState } from '@/shared/ui'

/** Заглушка раздела кабинета, который ещё не реализован (Очередь / Медиатека / Отчёты / Команда). */
export function SectionStub({ title }: { title: string }) {
  return (
    <Stack gap="lg">
      <Title order={2}>{title}</Title>
      <EmptyState title="Раздел скоро появится" description="Мы уже работаем над этим экраном." />
    </Stack>
  )
}
