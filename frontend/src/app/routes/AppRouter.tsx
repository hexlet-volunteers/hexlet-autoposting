import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/widgets/app-shell'
import { LandingPage } from '@/pages/landing'
import { ContentPlanPage } from '@/pages/content-plan'
import { QueuePage } from '@/pages/queue'
import { MediaPage } from '@/pages/media'
import { ReportsPage } from '@/pages/reports'
import { TeamPage } from '@/pages/team'
import { SettingsPage } from '@/pages/settings'
import { LoginPage } from '@/pages/login'
import { LegalPage } from '@/pages/legal'
import { PricingPage } from '@/pages/pricing'
import { NotFoundPage } from '@/pages/not-found'
import { RouteErrorPage, ServerErrorPage, ServiceUnavailablePage } from '@/pages/error'
import { AutopostingPage } from '@/pages/feature-autoposting'
import { CrosspostingPage } from '@/pages/feature-crossposting'
import { AiFeaturePage } from '@/pages/feature-ai'

const router = createBrowserRouter([
  {
    // Пустой корневой маршрут с errorElement — глобальная граница ошибок.
    element: <Outlet />,
    errorElement: <RouteErrorPage />,
    children: [
      // Публичный маркетинг-сайт
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/pricing', element: <PricingPage /> },
      { path: '/features/autoposting', element: <AutopostingPage /> },
      { path: '/features/crossposting', element: <CrosspostingPage /> },
      { path: '/features/ai', element: <AiFeaturePage /> },
      { path: '/legal', element: <LegalPage /> },
      { path: '/500', element: <ServerErrorPage /> },
      { path: '/503', element: <ServiceUnavailablePage /> },

      // Приложение (личный кабинет) под оболочкой с сайдбаром
      {
        path: 'app',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/app/calendar" replace /> },
          { path: 'calendar', element: <ContentPlanPage /> },
          { path: 'queue', element: <QueuePage /> },
          { path: 'media', element: <MediaPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'team', element: <TeamPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
