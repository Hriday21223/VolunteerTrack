import { NavLink, useLocation } from 'react-router-dom'
import { Home, Clock, Calendar, Trophy, FileText, User, Settings, Bell, ShieldCheck } from 'lucide-react'
import { cn } from '@/utils/cn.js'
import { useAuth } from '@/hooks/useAuth.jsx'

const ADMIN_EMAIL = 'karnatamhriday@gmail.com'

const ITEMS = [
  { to: '/',             label: 'Home',     icon: Home },
  { to: '/log',          label: 'Log',      icon: Clock },
  { to: '/calendar',     label: 'Calendar', icon: Calendar },
  { to: '/achievements', label: 'Awards',   icon: Trophy },
  { to: '/reminders',    label: 'Alerts',   icon: Bell },
  { to: '/reports',      label: 'Reports',  icon: FileText },
  { to: '/profile',      label: 'Profile',  icon: User },
  { to: '/settings',     label: 'Settings', icon: Settings },
]

/** Mobile bottom navigation. Max 5 visible items for usability. */
export default function MobileTabBar() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const items = user?.email === ADMIN_EMAIL
    ? [...ITEMS, { to: '/admin', label: 'Admin', icon: ShieldCheck }]
    : ITEMS
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-[#0f1a14] border-t border-earth-100 dark:border-[#1f2e25] pb-[env(safe-area-inset-bottom)]">
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium',
                  active
                    ? 'text-brand-700 dark:text-brand-300'
                    : 'text-earth-500 dark:text-earth-400',
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
