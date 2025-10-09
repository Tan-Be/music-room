import { useEffect, useState } from 'react'
import { useTheme as useNextTheme } from 'next-themes'

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(systemTheme === 'dark' ? 'light' : 'dark')
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  const isDarkMode =
    mounted &&
    (theme === 'dark' || (theme === 'system' && systemTheme === 'dark'))

  return {
    theme: mounted ? theme : undefined,
    isDarkMode,
    toggleTheme,
    setTheme,
    mounted,
  }
}
