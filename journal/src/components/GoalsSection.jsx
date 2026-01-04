import './GoalsSection.css'

function GoalsSection({ weeks, stats }) {
  if (!weeks || !stats?.goals) return null

  // Get current week (most recent)
  const weekKeys = Object.keys(weeks).sort().reverse()
  const currentWeekKey = weekKeys[0]
  const currentWeek = weeks[currentWeekKey]

  if (!currentWeek) return null

  const goals = currentWeek.goals || []
  const completed = currentWeek.goals_completed || []
  const goalStats = stats.goals || {}

  return (
    <div className="goals-section">
      <div className="goals-header">
        <h2>Weekly Goals</h2>
        <div className="goals-meta">
          <span className="week-label">{currentWeekKey}</span>
          <span className="completion-rate">
            {Math.round(goalStats.current_week?.percentage || 0)}% complete
          </span>
        </div>
      </div>

      <div className="goals-list">
        {goals.map((goal, idx) => {
          const isCompleted = completed.includes(goal)
          return (
            <div key={idx} className={`goal-item ${isCompleted ? 'completed' : ''}`}>
              <div className="goal-checkbox">
                {isCompleted ? '✓' : '○'}
              </div>
              <span className="goal-text">{goal}</span>
            </div>
          )
        })}
      </div>

      {currentWeek.review && (
        <div className="week-review">
          <div className="review-label">Week Review</div>
          <div className="review-text">{currentWeek.review}</div>
        </div>
      )}

      {currentWeek.highlight && (
        <div className="week-highlight">
          <span className="highlight-label">✨ Highlight:</span>
          <span className="highlight-text">{currentWeek.highlight}</span>
        </div>
      )}

      <div className="goals-stats">
        <div className="stat-item">
          <span className="stat-value">{goalStats.all_time?.total || 0}</span>
          <span className="stat-label">Total Goals</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{goalStats.all_time?.completed || 0}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{Math.round(goalStats.all_time?.percentage || 0)}%</span>
          <span className="stat-label">Success Rate</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{goalStats.streak || 0}</span>
          <span className="stat-label">Week Streak</span>
        </div>
      </div>
    </div>
  )
}

export default GoalsSection

