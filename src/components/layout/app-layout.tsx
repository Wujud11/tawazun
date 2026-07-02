import { Outlet } from 'react-router-dom'

import { Header } from './header'
import { Sidebar } from './sidebar'

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
