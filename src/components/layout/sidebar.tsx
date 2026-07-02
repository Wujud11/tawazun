import { Building2, FileText, LayoutDashboard, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

const navItems = [
  {
    to: '/',
    label: 'لوحة التحكم',
    icon: LayoutDashboard,
  },
  {
    to: '/companies',
    label: 'الشركات',
    icon: Building2,
  },
  {
    to: '/debts',
    label: 'الديون',
    icon: FileText,
  },
  {
    to: '/netting',
    label: 'المقاصة الذكية',
    icon: Sparkles,
  },
] as const

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-e border-border bg-sidebar md:block">
      <nav className="flex flex-col gap-1 p-4">
        <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">
          القائمة الرئيسية
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
