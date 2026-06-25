import { useEffect, useState, useCallback } from 'react'
import { keys, read, write } from '@/lib/storage.js'

export function applyStoredTheme() {
  const t = read(keys.theme, 'dark')
  document.documentElement.classList.toggle('dark', t === 'dark')
}

export function useTheme() {
  const [theme, setTheme] = useState(() => read(keys.theme, 'dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    write(keys.theme, theme)
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  return { theme, setTheme, toggle }
}
