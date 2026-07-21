import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../ThemeContext'
import { themes } from '../themes'

function ThemeSelector() {
  const { themeId, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const lightThemes = themes.filter((t) => t.group === 'light')
  const darkThemes = themes.filter((t) => t.group === 'dark')

  return (
    <div className="theme-selector" ref={panelRef}>
      <button
        className="theme-selector__trigger"
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Выбрать тему"
        title="Выбрать тему"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>

      {open && (
        <div className="theme-panel">
          <div className="theme-panel__header">
            <h3>Тема оформления</h3>
            <button
              className="theme-panel__close"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
            >
              &times;
            </button>
          </div>

          <div className="theme-panel__group">
            <p className="theme-panel__group-label">Светлые</p>
            <div className="theme-panel__grid">
              {lightThemes.map((t) => (
                <button
                  key={t.id}
                  className={
                    'theme-card' +
                    (themeId === t.id ? ' theme-card--active' : '')
                  }
                  type="button"
                  onClick={() => {
                    setTheme(t.id)
                    setOpen(false)
                  }}
                >
                  <div className="theme-card__preview">
                    <span
                      className="theme-card__swatch theme-card__swatch--bg"
                      style={{ background: t.bg }}
                    />
                    <span
                      className="theme-card__swatch theme-card__swatch--surface"
                      style={{ background: t.surface }}
                    />
                    <span
                      className="theme-card__swatch theme-card__swatch--accent"
                      style={{ background: t.accent }}
                    />
                    <span
                      className="theme-card__swatch theme-card__swatch--text"
                      style={{ background: t.text }}
                    />
                  </div>
                  <span className="theme-card__label">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="theme-panel__group">
            <p className="theme-panel__group-label">Тёмные</p>
            <div className="theme-panel__grid">
              {darkThemes.map((t) => (
                <button
                  key={t.id}
                  className={
                    'theme-card' +
                    (themeId === t.id ? ' theme-card--active' : '')
                  }
                  type="button"
                  onClick={() => {
                    setTheme(t.id)
                    setOpen(false)
                  }}
                >
                  <div className="theme-card__preview">
                    <span
                      className="theme-card__swatch theme-card__swatch--bg"
                      style={{ background: t.bg }}
                    />
                    <span
                      className="theme-card__swatch theme-card__swatch--surface"
                      style={{ background: t.surface }}
                    />
                    <span
                      className="theme-card__swatch theme-card__swatch--accent"
                      style={{ background: t.accent }}
                    />
                    <span
                      className="theme-card__swatch theme-card__swatch--text"
                      style={{ background: t.text }}
                    />
                  </div>
                  <span className="theme-card__label">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeSelector
