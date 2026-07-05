import { Alert, Center, Loader } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import type { ReactNode } from 'react'

interface QueryStateProps {
  isLoading: boolean
  error: unknown
  children: ReactNode
}

/** Standard loading/error wrapper for query-backed views. */
export function QueryState({ isLoading, error, children }: QueryStateProps) {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  }
  if (error) {
    const message = error instanceof Error ? error.message : 'Не удалось загрузить данные'
    return (
      <Alert color="red" icon={<IconAlertTriangle size={18} />} title="Ошибка">
        {message}
      </Alert>
    )
  }
  return <>{children}</>
}
