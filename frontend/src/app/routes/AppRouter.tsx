import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/widgets/app-shell'
import { LandingPage } from '@/pages/landing'
import { PostsPage } from '@/pages/posts'
import { PlatformsPage } from '@/pages/platforms'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { RouteErrorPage, ServerErrorPage, ServiceUnavailablePage } from '@/pages/error'

const router = createBrowserRouter([
  {
    // Пустой корневой маршрут с errorElement — глобальная граница ошибок.
    element: <Outlet />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/500', element: <ServerErrorPage /> },
      { path: '/503', element: <ServiceUnavailablePage /> },
      {
        element: <AppLayout />,
        children: [
          { path: 'posts', element: <PostsPage /> },
          { path: 'platforms', element: <PlatformsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
