import { useState, useEffect } from 'react'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import PracticeStreaks from './components/PracticeStreaks'
import Heatmap from './components/Heatmap'
import ReadingProgress from './components/ReadingProgress'
import GoalsSection from './components/GoalsSection'
import DayCards from './components/DayCards'
import TopicsCloud from './components/TopicsCloud'
import WeeklySummary from './components/WeeklySummary'
import BlogPosts from './components/BlogPosts'

function App() {
  const [entries, setEntries] = useState({})
  const [stats, setStats] = useState(null)
  const [weeks, setWeeks] = useState({})
  const [summaries, setSummaries] = useState({})
  const [blog, setBlog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function loadData() {
      try {
        const basePath = `${import.meta.env.BASE_URL}data`

        const [entriesRes, statsRes, weeksRes, summariesRes, blogRes] = await Promise.all([
          fetch(`${basePath}/entries.json`),
          fetch(`${basePath}/stats.json`),
          fetch(`${basePath}/weeks.json`),
          fetch(`${basePath}/summaries.json`).catch(() => ({ ok: false })),
          fetch(`${basePath}/blog.json`).catch(() => ({ ok: false }))
        ])

        if (!entriesRes.ok || !statsRes.ok || !weeksRes.ok) {
          throw new Error('Failed to load data')
        }

        const [entriesData, statsData, weeksData] = await Promise.all([
          entriesRes.json(),
          statsRes.json(),
          weeksRes.json()
        ])

        // Optional data
        const summariesData = summariesRes.ok ? await summariesRes.json() : {}
        const blogData = blogRes.ok ? await blogRes.json() : []

        setEntries(entriesData)
        setStats(statsData)
        setWeeks(weeksData)
        setSummaries(summariesData)
        setBlog(blogData)
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
        {/* Hero section: Weekly narrative + topics */}
        <WeeklySummary summaries={summaries} />

        {/* Stats ticker */}
        <StatsBar stats={stats} entries={entries} />

        <div className="grid-layout">
          <div className="main-column">
            <BlogPosts posts={blog} />
            <DayCards entries={entries} filter={filter} setFilter={setFilter} />
          </div>

          <aside className="side-column">
            <GoalsSection weeks={weeks} />
            <ReadingProgress stats={stats} />
            <PracticeStreaks stats={stats} />
            <Heatmap entries={entries} />
            <TopicsCloud stats={stats} />
          </aside>
        </div>
      </main>
    </div>
  )
}

export default App
