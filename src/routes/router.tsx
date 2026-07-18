import { Navigate, createBrowserRouter } from 'react-router-dom'

import { AppLayout, RootLayout } from '@/components/layout'
import { CompaniesPage, DashboardPage, DebtsPage, NettingPage } from '@/pages'
import { APP_LANDING_PATH } from '@/lib/app-entry'

/**
 * Route table. Landing is `/dashboard`.
 *
 * Hard loads of `/` or `/netting` are rewritten to `/dashboard` in
 * `normalizeAppEntryUrl()` (main.tsx) before this router mounts — that is what
 * stops restored browser tabs from reopening Netting.
 *
 * In-app paths to `/netting` (sidebar NavLink, notification Review) use
 * client-side navigation after mount and still work.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={APP_LANDING_PATH} replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'companies',
            element: <CompaniesPage />,
          },
          {
            path: 'debts',
            element: <DebtsPage />,
          },
          {
            path: 'netting',
            element: <NettingPage />,
          },
          {
            path: '*',
            element: <Navigate to={APP_LANDING_PATH} replace />,
          },
        ],
      },
    ],
  },
])
