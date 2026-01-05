import { useMemo } from 'react'

function getActivityLevel(entry) {
  if (!entry) return 0

  let score = 0
  const practice = entry.practice || {}

  score += (practice.leetcode?.length || 0) * 2
  score += (practice.sql?.length || 0) * 2
  score += (practice.system_design?.length || 0) * 3
  score += (practice.ml?.length || 0) * 2
  score += (entry.building?.length || 0) * 2
  score += (entry.reading?.length || 0) * 2
  score += (entry.exploring?.length || 0)

  if (score === 0) return 0
  if (score <= 2) return 1
  if (score <= 4) return 2
  if (score <= 6) return 3
  return 4
}

function Heatmap({ entries }) {
  const { weeks, months } = useMemo(() => {
    const today = new Date()
    const weeksData = []
    const monthsData = []

    // Go back 52 weeks
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 364)

    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay())

    let currentMonth = null

    for (let week = 0; week < 53; week++) {
      const weekDays = []

      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + week * 7 + day)

        const dateStr = date.toISOString().split('T')[0]
        const entry = entries[dateStr]
        const level = getActivityLevel(entry)

        // Track month changes
        const month = date.toLocaleString('default', { month: 'short' })
        if (month !== currentMonth && day === 0) {
          monthsData.push({ month, week })
          currentMonth = month
        }

        weekDays.push({
          date: dateStr,
          level,
          day: date.getDate(),
          future: date > today
        })
      }

      weeksData.push(weekDays)
    }

    return { weeks: weeksData, months: monthsData }
  }, [entries])

  return (
    <section className="heatmap card">
      <h2>Activity</h2>
      <div className="heatmap-container">
        <div className="heatmap-months">
          {months.map(({ month, week }, i) => (
            <span
              key={i}
              className="month-label"
              style={{ gridColumnStart: week + 1 }}
            >
              {month}
            </span>
          ))}
        </div>
        <div className="heatmap-grid">
          <div className="day-labels">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div className="weeks">
            {weeks.map((week, wi) => (
              <div key={wi} className="week">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`day level-${day.level}${day.future ? ' future' : ''}`}
                    title={`${day.date}: Level ${day.level}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-boxes">
            <div className="day level-0" />
            <div className="day level-1" />
            <div className="day level-2" />
            <div className="day level-3" />
            <div className="day level-4" />
          </div>
          <span>More</span>
        </div>
      </div>
    </section>
  )
}

export default Heatmap
