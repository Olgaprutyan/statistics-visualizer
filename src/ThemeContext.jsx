import { createContext, useContext, useEffect, useCallback } from 'react'
import { usePersistentState } from './usePersistentState'
import { DEFAULT_THEME } from './themes'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = usePersistentState('theme', DEFAULT_THEME)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId)
  }, [themeId])

  const setTheme = useCallback((id) => {
    setThemeId(id)
  }, [setThemeId])

  return (
    <ThemeContext.Provider value={{ themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
