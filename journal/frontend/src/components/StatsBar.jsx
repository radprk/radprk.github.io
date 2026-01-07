function StatsBar({ stats, entries }) {
  if (!stats) return null

  const practice = stats.practice || {}
  const totalProblems =
    (practice.leetcode?.total || 0) +
    (practice.sql?.total || 0) +
    (practice.system_design?.total || 0) +
    (practice.ml?.total || 0)

  const currentStreak = practice.leetcode?.current_streak || 0
  const longestStreak = practice.leetcode?.longest_streak || 0
  const goalRate = stats.goals?.all_time?.percentage || 0
  const daysTracked = Object.keys(entries || {}).length

  // Calculate total pages read
  let totalPages = 0
  if (stats.reading) {
    Object.values(stats.reading).forEach(book => {
      totalPages += book.pages_read || 0
    })
  }

  const tickerItems = [
    { value: totalProblems, label: 'problems solved' },
    { value: currentStreak, label: 'day streak' },
    { value: totalPages, label: 'pages read' },
    { value: `${goalRate}%`, label: 'goal rate' },
    { value: daysTracked, label: 'days tracked' },
    { value: longestStreak, label: 'best streak' },
  ]

  // Duplicate for seamless loop
  const allItems = [...tickerItems, ...tickerItems]

  return (
    <div className="stats-ticker">
      <div className="ticker-track">
        {allItems.map((item, i) => (
          <span key={i} className="ticker-item">
            <strong>{item.value}</strong> {item.label}
            <span className="ticker-dot">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default StatsBar
