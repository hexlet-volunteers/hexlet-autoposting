import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider as ReduxProvider } from 'react-redux'
import type { ReactNode } from 'react'
import { store } from '@/app/store'
import { queryClient } from '@/shared/config'
import { ErrorBoundary } from '@/shared/ui'
import { theme } from './theme'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications />
          {/* Глобальная граница ошибок: ловит падения рендера вне роутера, чтобы
              вместо белого экрана показать дружелюбный фолбэк с перезагрузкой.
              Внутри MantineProvider — фолбэку нужны компоненты Mantine. */}
          <ErrorBoundary>{children}</ErrorBoundary>
          <ReactQueryDevtools initialIsOpen={false} />
        </MantineProvider>
      </QueryClientProvider>
    </ReduxProvider>
  )
}
