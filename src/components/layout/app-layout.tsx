import { Building2, FileText, LayoutDashboard, Sparkles } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { cn } from '@/lib/utils'

import { Header } from './header'
import { Sidebar } from './sidebar'

const mobileNavItems = [
  { to: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { to: '/companies', label: 'الشركات', icon: Building2 },
  { to: '/debts', label: 'الديون', icon: FileText },
  { to: '/netting', label: 'المقاصة', icon: Sparkles },
] as const

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 pb-20 sm:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation — hidden on md+ where sidebar is shown */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden">
        <div className="flex">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              <item.icon className="size-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
