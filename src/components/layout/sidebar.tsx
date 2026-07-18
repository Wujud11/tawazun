import { Building2, FileText, LayoutDashboard, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils'

const navItems = [
  {
    to: '/dashboard',
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
    <aside className="hidden w-64 shrink-0 border-e border-sidebar-border bg-sidebar md:block">
      <nav className="flex flex-col gap-1 p-4">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          القائمة الرئيسية
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:shadow-sm',
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
