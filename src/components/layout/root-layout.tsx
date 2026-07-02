import { Outlet } from 'react-router-dom'

import { DirectionProvider } from '@/providers'

export function RootLayout() {
  return (
    <DirectionProvider direction="rtl">
      <Outlet />
    </DirectionProvider>
  )
}
