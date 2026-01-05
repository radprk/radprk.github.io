function StatsBar({ stats, entries }) {
  if (!stats) return null

  const practice = stats.practice || {}
  const totalProblems =
    (practice.leetcode?.total || 0) +
    (practice.sql?.total || 0) +
    (practice.system_design?.total || 0) +
    (practice.ml?.total || 0)

  const bestStreak = Math.max(
    practice.leetcode?.longest_streak || 0,
    practice.sql?.longest_streak || 0,
    practice.system_design?.longest_streak || 0,
    practice.ml?.longest_streak || 0
  )

  const goalRate = stats.goals?.all_time?.percentage || 0
  const booksInProgress = Object.keys(stats.reading || {}).length

  const statItems = [
    { label: 'Problems Solved', value: totalProblems, icon: '🧩' },
    { label: 'Best Streak', value: `${bestStreak} days`, icon: '🔥' },
    { label: 'Goal Rate', value: `${goalRate}%`, icon: '🎯' },
    { label: 'Books Active', value: booksInProgress, icon: '📚' },
  ]

  return (
    <div className="stats-bar">
      {statItems.map((item, i) => (
        <div key={i} className="stat-item">
          <span className="stat-icon">{item.icon}</span>
          <div className="stat-content">
            <span className="stat-value">{item.value}</span>
            <span className="stat-label">{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsBar
