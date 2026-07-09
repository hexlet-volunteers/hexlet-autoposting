import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Button } from '@mantine/core'
import { ErrorScreen } from './ErrorScreen'

interface ErrorBoundaryProps {
  children: ReactNode
  /**
   * Своя разметка вместо полноэкранного фолбэка. Для изоляции модалок передаём
   * `null` — упавшая модалка просто исчезает, остальное приложение живёт.
   */
  fallback?: ReactNode
  /** Хук для мониторинга (Sentry и т.п.); console.* в проекте запрещён линтером. */
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Граница ошибок React: ловит исключения рендера в поддереве и показывает фолбэк
 * вместо белого экрана. Верхний уровень — полноэкранный ErrorScreen с кнопкой
 * перезагрузки; вокруг рисковых модалок — `fallback={null}`, чтобы падение одной
 * не роняло соседние и всю оболочку.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Переходим в состояние «есть ошибка» — на следующем рендере покажем фолбэк.
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Точка расширения для мониторинга; здесь только прокидываем наружу.
    this.props.onError?.(error, info)
  }

  render(): ReactNode {
    if (this.state.error) {
      if (this.props.fallback !== undefined) return this.props.fallback
      return (
        <ErrorScreen
          code="500"
          title="Что-то пошло не так"
          description="Произошла непредвиденная ошибка. Попробуйте обновить страницу — мы уже разбираемся."
          action={<Button onClick={() => window.location.reload()}>Обновить страницу</Button>}
        />
      )
    }
    return this.props.children
  }
}
