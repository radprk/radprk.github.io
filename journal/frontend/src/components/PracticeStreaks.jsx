function StreakCounter({ category, data, color }) {
  const current = data?.current_streak || 0
  const longest = data?.longest_streak || 0
  const total = data?.total || 0

  return (
    <div className="streak-counter" style={{ '--accent': color }}>
      <div className="streak-header">
        <span className="streak-category">{category}</span>
        <span className="streak-total">{total} total</span>
      </div>
      <div className="streak-value">
        <span className="current">{current}</span>
        <span className="unit">day streak</span>
      </div>
      <div className="streak-bar">
        <div
          className="streak-fill"
          style={{ width: `${longest > 0 ? (current / longest) * 100 : 0}%` }}
        />
      </div>
      <div className="streak-longest">longest: {longest}</div>
    </div>
  )
}

function PracticeStreaks({ stats }) {
  if (!stats?.practice) return null

  const categories = [
    { key: 'leetcode', label: 'LeetCode', color: '#f89f1b' },
    { key: 'sql', label: 'SQL', color: '#336791' },
    { key: 'system_design', label: 'System Design', color: '#5eead4' },
    { key: 'ml', label: 'ML', color: '#a855f7' },
  ]

  return (
    <section className="practice-streaks card">
      <h2>Practice Streaks</h2>
      <div className="streaks-grid">
        {categories.map(({ key, label, color }) => (
          <StreakCounter
            key={key}
            category={label}
            data={stats.practice[key]}
            color={color}
          />
        ))}
      </div>
    </section>
  )
}

export default PracticeStreaks
