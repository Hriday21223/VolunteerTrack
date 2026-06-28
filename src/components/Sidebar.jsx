import { Home, Clock, Calendar, Trophy, FileText, User, Settings, Bell, Shield, HelpCircle } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'
import { cn } from '@/utils/cn.js'
import { useMemo } from 'react'

const ADMIN_EMAIL = 'karnatamhriday@gmail.com'

const ITEMS = [
  { to: '/',           label: 'Dashboard',   icon: Home },
  { to: '/log',        label: 'Log Hours',   icon: Clock },
  { to: '/calendar',   label: 'Calendar',    icon: Calendar },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/reminders',  label: 'Reminders',   icon: Bell },
  { to: '/reports',    label: 'Reports',     icon: FileText },
  { to: '/profile',    label: 'Profile',     icon: User },
  { to: '/settings',   label: 'Settings',    icon: Settings },
  { to: '/help',       label: 'Help',        icon: HelpCircle },
]

const ADMIN_ITEM = { to: '/admin', label: 'Admin', icon: Shield }

export default function Sidebar() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('voluntrack:user') || '{}'), [])
  const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  return (
    <aside className="hidden md:flex md:flex-col w-72 shrink-0 border-r border-earth-900/80 bg-[#06141a] text-earth-200 sticky top-0 h-screen">
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="VolunTrack" className="w-11 h-11 object-contain" />
          <div>
            <div className="font-display font-bold text-lg leading-none">VolunTrack</div>
            <div className="text-xs text-earth-400 mt-0.5">Volunteer hour tracker</div>
          </div>
        </div>
      </div>

      <nav className="px-4 py-3 flex-1 space-y-1">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition',
                isActive
                  ? 'bg-brand-700/10 text-white shadow-sm shadow-brand-500/10'
                  : 'text-earth-300 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to={ADMIN_ITEM.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition',
                isActive
                  ? 'bg-brand-700/10 text-white shadow-sm shadow-brand-500/10'
                  : 'text-earth-300 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <ADMIN_ITEM.icon className="w-4 h-4" />
            {ADMIN_ITEM.label}
          </NavLink>
        )}
      </nav>

      <div className="px-5 pb-6 pt-4 text-xs text-earth-400 border-t border-earth-900/80">
        <div className="rounded-3xl bg-white/5 p-3 text-earth-300">
          Private local storage only. No upload required.
        </div>
        <div className="mt-4 flex gap-3">
          <Link to="/about" className="text-earth-300 hover:text-white">About</Link>
          <Link to="/contact" className="text-earth-300 hover:text-white">Contact</Link>
        </div>
        <div className="mt-4 text-earth-500">© VolunTrack 2026</div>
      </div>
    </aside>
  )
}
