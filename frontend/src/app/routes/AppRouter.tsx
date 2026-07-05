import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from '@/widgets/app-shell'
import { LandingPage } from '@/pages/landing'
import { PostsPage } from '@/pages/posts'
import { PlatformsPage } from '@/pages/platforms'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: 'posts', element: <PostsPage /> },
      { path: 'platforms', element: <PlatformsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
