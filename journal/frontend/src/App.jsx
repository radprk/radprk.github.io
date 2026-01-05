import { useState, useEffect } from 'react'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import PracticeStreaks from './components/PracticeStreaks'
import Heatmap from './components/Heatmap'
import ReadingProgress from './components/ReadingProgress'
import GoalsSection from './components/GoalsSection'
import DayCards from './components/DayCards'
import TopicsCloud from './components/TopicsCloud'

function App() {
  const [entries, setEntries] = useState({})
  const [stats, setStats] = useState(null)
  const [weeks, setWeeks] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function loadData() {
      try {
        const basePath = `${import.meta.env.BASE_URL}data`

        const [entriesRes, statsRes, weeksRes] = await Promise.all([
          fetch(`${basePath}/entries.json`),
          fetch(`${basePath}/stats.json`),
          fetch(`${basePath}/weeks.json`)
        ])

        if (!entriesRes.ok || !statsRes.ok || !weeksRes.ok) {
          throw new Error('Failed to load data')
        }

        const [entriesData, statsData, weeksData] = await Promise.all([
          entriesRes.json(),
          statsRes.json(),
          weeksRes.json()
        ])

        setEntries(entriesData)
        setStats(statsData)
        setWeeks(weeksData)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="app loading">
        <div className="loader">Loading journal...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app error">
        <div className="error-message">
          <h2>Couldn't load journal data</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Header />

      <main className="container">
        <StatsBar stats={stats} entries={entries} />

        <div className="grid-layout">
          <div className="main-column">
            <PracticeStreaks stats={stats} />
            <Heatmap entries={entries} />
            <DayCards entries={entries} filter={filter} setFilter={setFilter} />
          </div>

          <aside className="side-column">
            <ReadingProgress stats={stats} />
            <GoalsSection weeks={weeks} />
            <TopicsCloud stats={stats} />
          </aside>
        </div>
      </main>
    </div>
  )
}

export default App
