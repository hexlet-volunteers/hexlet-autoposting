import { AppProviders } from './providers/AppProviders'
import { AppRouter } from './routes/AppRouter'

// AuthModal живёт внутри роутера (корневой маршрут AppRouter): формам входа
// нужен useNavigate, а он доступен только под RouterProvider.
export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
