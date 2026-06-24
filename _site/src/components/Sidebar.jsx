import { Home, Clock, Calendar, Trophy, FileText, User, Settings, Heart, Bell, ShieldCheck, Instagram } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn.js'
import { useAuth } from '@/hooks/useAuth.jsx'

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
]

export default function Sidebar() {
  const { user } = useAuth()
  return (
    <aside className="hidden md:flex md:flex-col w-72 shrink-0 border-r border-earth-900/80 bg-[#06141a] text-earth-200 sticky top-0 h-screen">
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white shadow-soft">
            <Heart className="w-5 h-5" />
          </div>
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
        {user?.email === ADMIN_EMAIL && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition',
                isActive
                  ? 'bg-brand-700/10 text-white shadow-sm shadow-brand-500/10'
                  : 'text-earth-300 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <ShieldCheck className="w-4 h-4" />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="px-5 pb-6 pt-4 text-xs text-earth-400 border-t border-earth-900/80">
        <div className="rounded-3xl bg-white/5 p-3 text-earth-300">
          Private local storage only. No upload required.
        </div>
        <div className="mt-4 flex gap-3">
          <a href="/about" className="text-earth-300 hover:text-white">About</a>
          <a href="/contact" className="text-earth-300 hover:text-white">Contact</a>
          <a href="https://www.instagram.com/volunteertrackofficial/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-earth-300 hover:text-white" aria-label="Instagram">
            <Instagram className="w-3.5 h-3.5" /> Instagram
          </a>
        </div>
        <div className="mt-4 text-earth-500">© {new Date().getFullYear()}</div>
      </div>
    </aside>
  )
}
