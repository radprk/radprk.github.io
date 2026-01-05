import { useMemo } from 'react'

function GoalsSection({ weeks }) {
  const currentWeek = useMemo(() => {
    // Get the most recent week
    const weekIds = Object.keys(weeks).sort().reverse()
    if (weekIds.length === 0) return null

    const weekId = weekIds[0]
    return { id: weekId, ...weeks[weekId] }
  }, [weeks])

  if (!currentWeek) return null

  const goals = currentWeek.goals || []
  const completed = currentWeek.goals_completed || []
  const completedSet = new Set(completed.map(g => g.toLowerCase()))

  const completionRate = goals.length > 0
    ? Math.round((completed.length / goals.length) * 100)
    : 0

  return (
    <section className="goals-section card">
      <div className="goals-header">
        <h2>Goals</h2>
        <span className="week-id">{currentWeek.id}</span>
      </div>

      <div className="completion-rate">
        <div className="rate-bar">
          <div className="rate-fill" style={{ width: `${completionRate}%` }} />
        </div>
        <span className="rate-text">
          {completed.length}/{goals.length} ({completionRate}%)
        </span>
      </div>

      <ul className="goals-list">
        {goals.map((goal, i) => {
          const isCompleted = completedSet.has(goal.toLowerCase())
          return (
            <li key={i} className={isCompleted ? 'completed' : ''}>
              <span className="checkbox">{isCompleted ? '✓' : '○'}</span>
              <span className="goal-text">{goal}</span>
            </li>
          )
        })}
      </ul>

      {currentWeek.highlight && (
        <div className="week-highlight">
          <span className="highlight-label">Highlight:</span>
          <span className="highlight-text">{currentWeek.highlight}</span>
        </div>
      )}
    </section>
  )
}

export default GoalsSection
