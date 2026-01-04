import { useState, useEffect } from 'react'
import HeaderStats from './components/HeaderStats'
import PracticeStreaks from './components/PracticeStreaks'
import HeatmapCalendar from './components/HeatmapCalendar'
import ReadingProgress from './components/ReadingProgress'
import GoalsSection from './components/GoalsSection'
import DayCards from './components/DayCards'
import ExploringTagCloud from './components/ExploringTagCloud'
import './App.css'

function App() {
  const [entries, setEntries] = useState(null)
  const [stats, setStats] = useState(null)
  const [weeks, setWeeks] = useState(null)
  const [books, setBooks] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterTopic, setFilterTopic] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Use paths that work in both dev and production
        // BASE_URL includes trailing slash, e.g., '/journal/'
        const basePath = import.meta.env.BASE_URL
        const [entriesRes, statsRes, weeksRes, booksRes] = await Promise.all([
          fetch(`${basePath}data/entries.json`),
          fetch(`${basePath}data/stats.json`),
          fetch(`${basePath}data/weeks.json`),
          fetch(`${basePath}config/books.json`)
        ])

        if (!entriesRes.ok || !statsRes.ok || !weeksRes.ok || !booksRes.ok) {
          throw new Error('Failed to load data')
        }

        const [entriesData, statsData, weeksData, booksData] = await Promise.all([
          entriesRes.json(),
          statsRes.json(),
          weeksRes.json(),
          booksRes.json()
        ])

        setEntries(entriesData)
        setStats(statsData)
        setWeeks(weeksData)
        setBooks(booksData)
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
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading journal...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-error">
        <p>Error loading journal: {error}</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Journal</h1>
        <a href="/" className="back-link">← Back to site</a>
      </header>

      <main className="app-main">
        <HeaderStats stats={stats} />
        
        <section className="section">
          <PracticeStreaks stats={stats} />
        </section>

        <section className="section">
          <HeatmapCalendar entries={entries} />
        </section>

        <section className="section">
          <ReadingProgress stats={stats} books={books} />
        </section>

        <section className="section">
          <GoalsSection weeks={weeks} stats={stats} />
        </section>

        <section className="section">
          <ExploringTagCloud stats={stats} onTopicClick={setFilterTopic} />
        </section>

        <section className="section">
          <DayCards entries={entries} filterTopic={filterTopic} />
        </section>
      </main>
    </div>
  )
}

export default App

