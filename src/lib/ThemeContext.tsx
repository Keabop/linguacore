import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ColorMode = 'light' | 'dark'

interface ThemeContextValue {
  mode: ColorMode
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(() => {
    return (localStorage.getItem('theme-mode') as ColorMode) ?? 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    // Dark mode via .dark class (light is default — no class needed)
    root.classList.toggle('dark', mode === 'dark')
    // Clean up attributes left by the old colour themes
    root.classList.remove('light')
    root.removeAttribute('data-theme')
    localStorage.removeItem('theme-pro')
    localStorage.setItem('theme-mode', mode)
  }, [mode])

  const toggleMode = () => setMode(m => m === 'light' ? 'dark' : 'light')

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export type { ColorMode }
