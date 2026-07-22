import './App.css'
import { ThemeProvider } from './ThemeContext'
import { ChapterProvider, useChapter } from './ChapterContext'
import Sidebar from './components/Sidebar'
import ThemeSelector from './components/ThemeSelector'
import CentralLimitPage from './pages/CentralLimitPage'
import ProbabilityAndDataPage from './pages/ProbabilityAndDataPage'
import ProbabilityLanguagePage from './pages/ProbabilityLanguagePage'

function ChapterView() {
  const { activeChapter } = useChapter()

  if (activeChapter === 'probability-data') {
    return <ProbabilityAndDataPage />
  }

  if (activeChapter === 'probability-language') {
    return <ProbabilityLanguagePage />
  }

  return <CentralLimitPage />
}

function App() {
  return (
    <ThemeProvider>
      <ChapterProvider>
        <div className="app">
          <Sidebar />
          <ThemeSelector />
          <ChapterView />
        </div>
      </ChapterProvider>
    </ThemeProvider>
  )
}

export default App
