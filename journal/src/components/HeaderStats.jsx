import './HeaderStats.css'

function HeaderStats({ stats }) {
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

  const goalCompletion = stats.goals?.all_time?.percentage || 0
  const booksInProgress = stats.reading ? Object.keys(stats.reading).length : 0

  return (
    <div className="header-stats">
      <div className="stat-item">
        <div className="stat-value">{totalProblems}</div>
        <div className="stat-label">Total Problems</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{bestStreak}</div>
        <div className="stat-label">Best Streak</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{Math.round(goalCompletion)}%</div>
        <div className="stat-label">Goals Complete</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{booksInProgress}</div>
        <div className="stat-label">Books in Progress</div>
      </div>
    </div>
  )
}

export default HeaderStats

