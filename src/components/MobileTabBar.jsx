import { NavLink, useLocation, Link } from 'react-router-dom'
import { Home, Clock, Calendar, Trophy, FileText, User, Settings, Bell, Plus, Shield, HelpCircle } from 'lucide-react'
import { cn } from '@/utils/cn.js'
import { useMemo } from 'react'

const ADMIN_EMAIL = 'karnatamhriday@gmail.com'

const ITEMS = [
  { to: '/',             label: 'Home',     icon: Home },
  { to: '/log',          label: 'Log',      icon: Clock },
  { to: '/calendar',     label: 'Calendar', icon: Calendar },
  { to: '/achievements', label: 'Awards',   icon: Trophy },
  { to: '/reports',      label: 'Reports',  icon: FileText },
  { to: '/profile',      label: 'Profile',  icon: User },
  { to: '/settings',     label: 'Settings', icon: Settings },
  { to: '/help',         label: 'Help',     icon: HelpCircle },
]

const ADMIN_ITEM = { to: '/admin', label: 'Admin', icon: Shield }

export default function MobileTabBar() {
  const { pathname } = useLocation()
  const user = useMemo(() => JSON.parse(localStorage.getItem('voluntrack:user') || '{}'), [])
  const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  
  const allItems = isAdmin ? [...ITEMS, ADMIN_ITEM] : ITEMS

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30">
      <div className="mx-4 mb-4 rounded-[1.5rem] bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl border border-earth-200/50 dark:border-white/10 shadow-2xl shadow-black/5 dark:shadow-black/20">
        <ul className={`grid px-1 pt-1 ${isAdmin ? 'grid-cols-9' : 'grid-cols-8'}`}>
          {allItems.map(({ to, label, icon: Icon }) => {
            const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium relative transition-all duration-200',
                    active
                      ? 'text-brand-600 dark:text-brand-400 scale-105'
                      : 'text-earth-500 dark:text-earth-400 hover:text-earth-800 dark:hover:text-earth-200',
                  )}
                >
                  {active && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-brand-500 dark:bg-brand-400" />
                  )}
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                  {label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>
      <Link
        to="/log"
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/40 flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus className="w-6 h-6" strokeWidth={3} />
      </Link>
    </nav>
  )
}
