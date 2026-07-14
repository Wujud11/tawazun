import { Building2, FileText, Info, LayoutDashboard, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { LIVE_DEMO_URL } from '@/lib/site'
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
  {
    to: '/about',
    label: 'عن المنصة',
    icon: Info,
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

      <div className="mx-4 mt-6 space-y-3">
        <Button asChild className="w-full gap-2" size="sm">
          <a href={LIVE_DEMO_URL} target="_blank" rel="noopener noreferrer">
            <Sparkles className="size-4" />
            تجربة مباشرة
          </a>
        </Button>
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-4">
          <p className="text-xs font-semibold text-foreground">كفاءة المقاصة</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-primary">62%</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            توفير 2,923,000 ريال هذا الشهر
          </p>
        </div>
      </div>
    </aside>
  )
}
