import { useState, useEffect } from 'react'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
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
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved) return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

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

        // Optional data - fetch separately with proper error handling
        let summariesData = {}
        let blogData = []

        try {
          const summariesRes = await fetch(`${basePath}/summaries.json`)
          if (summariesRes.ok) {
            summariesData = await summariesRes.json()
          }
        } catch (e) {
          console.log('Summaries not available')
        }

        try {
          const blogRes = await fetch(`${basePath}/blog.json`)
          if (blogRes.ok) {
            blogData = await blogRes.json()
          }
        } catch (e) {
          console.log('Blog not available')
        }

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
      <Header theme={theme} toggleTheme={toggleTheme} />

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
            <Heatmap entries={entries} />
            <TopicsCloud stats={stats} />
          </aside>
        </div>
      </main>
    </div>
  )
}

export default App
