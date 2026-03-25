import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ColorMode = 'light' | 'dark'
type ProTheme = 'purple' | 'ocean' | 'forest' | 'midnight'

interface ThemeContextValue {
  mode: ColorMode
  proTheme: ProTheme
  toggleMode: () => void
  setProTheme: (theme: ProTheme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(() => {
    return (localStorage.getItem('theme-mode') as ColorMode) ?? 'light'
  })
  const [proTheme, setProThemeState] = useState<ProTheme>(() => {
    return (localStorage.getItem('theme-pro') as ProTheme) ?? 'purple'
  })

  useEffect(() => {
    const root = document.documentElement
    // Dark mode via .dark class (light is default — no class needed)
    root.classList.toggle('dark', mode === 'dark')
    // Remove old .light class if present
    root.classList.remove('light')
    // Pro theme via data-theme attribute
    root.setAttribute('data-theme', proTheme)
    localStorage.setItem('theme-mode', mode)
  }, [mode, proTheme])

  useEffect(() => {
    localStorage.setItem('theme-pro', proTheme)
  }, [proTheme])

  const toggleMode = () => setMode(m => m === 'light' ? 'dark' : 'light')

  const setProTheme = (theme: ProTheme) => {
    setProThemeState(theme)
  }

  return (
    <ThemeContext.Provider value={{ mode, proTheme, toggleMode, setProTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export type { ColorMode, ProTheme }
