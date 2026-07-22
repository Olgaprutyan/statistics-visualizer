import { createContext, useContext, useCallback } from 'react'
import { usePersistentState } from './usePersistentState'

/*
 * Простая клиентская навигация между главами без роутера.
 * Активная глава хранится в localStorage; sidebar переключает её.
 */
const ChapterContext = createContext()

const DEFAULT_CHAPTER = 'central-limit-theorem'

export function ChapterProvider({ children }) {
  const [activeChapter, setActiveChapter] = usePersistentState(
    'chapter',
    DEFAULT_CHAPTER,
  )

  const goToChapter = useCallback(
    (id) => {
      setActiveChapter(id)
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'auto' })
      }
    },
    [setActiveChapter],
  )

  return (
    <ChapterContext.Provider value={{ activeChapter, goToChapter }}>
      {children}
    </ChapterContext.Provider>
  )
}

export function useChapter() {
  return useContext(ChapterContext)
}
