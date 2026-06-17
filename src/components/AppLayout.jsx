import { useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun, Menu } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth.jsx'
import { useTheme } from '@/hooks/useTheme.js'
import { cn } from '@/utils/cn.js'
import Sidebar from './Sidebar.jsx'

export default function AppLayout({ children, title, subtitle, action }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      {/* mobile drawer */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 transition',
          drawerOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!drawerOpen}
      >
        <div
          className={cn('absolute inset-0 bg-black/30 transition-opacity', drawerOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#0f1a14] shadow-soft transition-transform',
            drawerOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div onClick={() => setDrawerOpen(false)}><Sidebar /></div>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0f1a14]/80 backdrop-blur border-b border-earth-100 dark:border-[#1f2e25]">
          <div className="px-4 md:px-8 py-4 flex items-center gap-3">
            <button
              className="md:hidden p-2 -ml-2 rounded-lg text-earth-600 dark:text-earth-300"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              {title && <h1 className="text-xl md:text-2xl font-bold truncate">{title}</h1>}
              {subtitle && <p className="text-sm text-earth-500 dark:text-earth-400 truncate">{subtitle}</p>}
            </div>
            {action}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-earth-600 hover:bg-earth-100 dark:text-earth-200 dark:hover:bg-[#1b2a22]"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-earth-100 dark:border-[#1f2e25]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center text-white text-sm font-bold">
                {user?.name?.[0]?.toUpperCase() || 'V'}
              </div>
              <div className="text-sm">
                <div className="font-medium leading-tight">{user?.name || 'Volunteer'}</div>
                <div className="text-xs text-earth-500 dark:text-earth-400 leading-tight">{user?.school || '—'}</div>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="p-2 rounded-lg text-earth-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
