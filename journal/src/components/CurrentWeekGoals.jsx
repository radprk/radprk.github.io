import './CurrentWeekGoals.css'

function CurrentWeekGoals({ weeks, stats }) {
  if (!weeks || !stats?.goals) return null

  // Get current week (most recent)
  const weekKeys = Object.keys(weeks).sort().reverse()
  const currentWeekKey = weekKeys[0]
  const currentWeek = weeks[currentWeekKey]

  if (!currentWeek) return null

  const goals = currentWeek.goals || []
  const completed = currentWeek.goals_completed || []
  const goalStats = stats.goals || {}
  const completionRate = goalStats.current_week?.percentage || 0

  return (
    <div className="current-week-goals">
      <div className="goals-header-main">
        <div>
          <h2>This Week's Goals</h2>
          <span className="week-badge">{currentWeekKey}</span>
        </div>
        <div className="completion-circle">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="var(--border)"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 35}`}
              strokeDashoffset={`${2 * Math.PI * 35 * (1 - completionRate / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div className="completion-text">
            <span className="completion-percent">{Math.round(completionRate)}%</span>
            <span className="completion-label">Complete</span>
          </div>
        </div>
      </div>

      <div className="goals-grid">
        {goals.map((goal, idx) => {
          const isCompleted = completed.includes(goal)
          return (
            <div key={idx} className={`goal-card ${isCompleted ? 'completed' : ''}`}>
              <div className="goal-check">
                <div className={`check-circle ${isCompleted ? 'checked' : ''}`}>
                  {isCompleted && <span className="check-mark">✓</span>}
                </div>
              </div>
              <div className="goal-content">
                <span className="goal-text">{goal}</span>
              </div>
            </div>
          )
        })}
      </div>

      {currentWeek.review && (
        <div className="week-review-card">
          <div className="review-header">Week Review</div>
          <div className="review-content">{currentWeek.review}</div>
        </div>
      )}

      {currentWeek.highlight && (
        <div className="week-highlight-card">
          <div className="highlight-header">Highlight</div>
          <div className="highlight-content">{currentWeek.highlight}</div>
        </div>
      )}
    </div>
  )
}

export default CurrentWeekGoals

