import './PracticeStreaks.css'

function PracticeStreaks({ stats }) {
  if (!stats?.practice) return null

  const categories = [
    { key: 'leetcode', label: 'LeetCode', emoji: '💻' },
    { key: 'sql', label: 'SQL', emoji: '🗄️' },
    { key: 'system_design', label: 'System Design', emoji: '🏗️' },
    { key: 'ml', label: 'ML', emoji: '🧠' }
  ]

  return (
    <div className="practice-streaks">
      <h2>Practice Streaks</h2>
      <div className="streaks-grid">
        {categories.map(cat => {
          const data = stats.practice[cat.key]
          if (!data) return null

          const current = data.current_streak || 0
          const longest = data.longest_streak || 0
          const total = data.total || 0

          return (
            <div key={cat.key} className="streak-card">
              <div className="streak-header">
                <span className="streak-emoji">{cat.emoji}</span>
                <span className="streak-label">{cat.label}</span>
              </div>
              <div className="streak-stats">
                <div className="streak-current">
                  <span className="streak-number">{current}</span>
                  <span className="streak-text">day streak</span>
                </div>
                <div className="streak-longest">
                  longest: {longest}
                </div>
                <div className="streak-total">
                  {total} total
                </div>
              </div>
              <div className="streak-visual">
                {Array.from({ length: Math.min(longest, 30) }).map((_, i) => (
                  <div
                    key={i}
                    className={`streak-box ${i < current ? 'active' : ''}`}
                    style={{ opacity: i < longest ? 0.3 + (i / longest) * 0.7 : 0.1 }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PracticeStreaks

