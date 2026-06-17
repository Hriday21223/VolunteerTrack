import { Home, Clock, Calendar, Trophy, FileText, User, Settings, Heart, Bell } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn.js'

const ITEMS = [
  { to: '/',           label: 'Dashboard',   icon: Home },
  { to: '/log',        label: 'Log Hours',   icon: Clock },
  { to: '/calendar',   label: 'Calendar',    icon: Calendar },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/reminders',  label: 'Reminders',   icon: Bell },
  { to: '/reports',    label: 'Reports',     icon: FileText },
  { to: '/profile',    label: 'Profile',     icon: User },
  { to: '/settings',   label: 'Settings',    icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-earth-100 dark:border-[#1f2e25] bg-white/60 dark:bg-[#0f1a14]/60 backdrop-blur sticky top-0 h-screen">
      <div className="px-5 py-5 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white shadow-soft">
          <Heart className="w-5 h-5" />
        </div>
        <div>
          <div className="font-display font-bold text-lg leading-none">VolunTrack</div>
          <div className="text-[11px] text-earth-500 dark:text-earth-400 mt-0.5">Volunteer hour tracker</div>
        </div>
      </div>

      <nav className="px-3 py-2 flex-1 space-y-0.5">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition',
                isActive
                  ? 'bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200'
                  : 'text-earth-700 hover:bg-earth-50 dark:text-earth-200 dark:hover:bg-[#1b2a22]',
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 text-xs text-earth-500 dark:text-earth-400 border-t border-earth-100 dark:border-[#1f2e25]">
        <div className="flex gap-3">
          <a href="/about" className="hover:text-brand-700">About</a>
          <a href="/contact" className="hover:text-brand-700">Contact</a>
        </div>
        <div className="mt-2">© {new Date().getFullYear()} VolunTrack</div>
      </div>
    </aside>
  )
}
