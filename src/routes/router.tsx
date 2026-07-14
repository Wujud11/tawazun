import { createBrowserRouter } from 'react-router-dom'

import { AppLayout, RootLayout } from '@/components/layout'
import { CompaniesPage, DashboardPage, DebtsPage, NettingPage, AboutPage } from '@/pages'

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
            path: 'about',
            element: <AboutPage />,
          },
        ],
      },
    ],
  },
])
