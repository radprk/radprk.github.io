import { useState, useMemo } from 'react'
import './HeatmapCalendar.css'

function HeatmapCalendar({ entries }) {
  const [hoveredDate, setHoveredDate] = useState(null)

  if (!entries) return null

  // Generate calendar data
  const calendarData = useMemo(() => {
    const dates = Object.keys(entries).sort()
    if (dates.length === 0) return []

    const firstDate = new Date(dates[0])
    const lastDate = new Date(dates[dates.length - 1])
    
    // Get start of first week (Sunday)
    const start = new Date(firstDate)
    start.setDate(start.getDate() - start.getDay())
    
    // Get end of last week (Saturday)
    const end = new Date(lastDate)
    end.setDate(end.getDate() + (6 - end.getDay()))

    const weeks = []
    const current = new Date(start)

    while (current <= end) {
      const week = []
      for (let i = 0; i < 7; i++) {
        const dateStr = current.toISOString().split('T')[0]
        const entry = entries[dateStr]
        
        // Calculate activity score
        let score = 0
        if (entry) {
          const practice = entry.practice || {}
          score += (practice.leetcode?.length || 0) * 2
          score += (practice.sql?.length || 0) * 2
          score += (practice.system_design?.length || 0) * 2
          score += (practice.ml?.length || 0) * 2
          score += (entry.building?.length || 0) * 3
          score += (entry.reading?.length || 0) * 2
          score += (entry.exploring?.length || 0) * 1
          score += entry.notes ? 1 : 0
        }

        week.push({
          date: dateStr,
          dateObj: new Date(current),
          entry,
          score
        })
        current.setDate(current.getDate() + 1)
      }
      weeks.push(week)
    }

    return weeks
  }, [entries])

  const getIntensity = (score) => {
    if (score === 0) return 0
    if (score <= 3) return 1
    if (score <= 6) return 2
    if (score <= 10) return 3
    return 4
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const scrollToDate = (dateStr) => {
    const element = document.getElementById(`day-card-${dateStr}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.classList.add('highlight')
      setTimeout(() => element.classList.remove('highlight'), 2000)
    }
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Get unique months for labels
  const months = useMemo(() => {
    const monthSet = new Set()
    calendarData.forEach(week => {
      week.forEach(day => {
        if (day.entry) {
          monthSet.add(day.dateObj.getMonth())
        }
      })
    })
    return Array.from(monthSet).sort()
  }, [calendarData])

  return (
    <div className="heatmap-calendar">
      <h2>Activity Heatmap</h2>
      <div className="heatmap-container">
        <div className="heatmap-labels">
          <div className="day-labels">
            {dayLabels.map(day => (
              <div key={day} className="day-label">{day}</div>
            ))}
          </div>
        </div>
        <div className="heatmap-grid">
          {calendarData.map((week, weekIdx) => (
            <div key={weekIdx} className="heatmap-week">
              {week.map((day, dayIdx) => {
                const intensity = getIntensity(day.score)
                const hasEntry = !!day.entry
                
                return (
                  <div
                    key={day.date}
                    className={`heatmap-day intensity-${intensity} ${hasEntry ? 'has-entry' : ''}`}
                    onMouseEnter={() => setHoveredDate(day.date)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={() => hasEntry && scrollToDate(day.date)}
                    title={hasEntry ? `${formatDate(day.date)} - Activity: ${day.score}` : formatDate(day.date)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      {hoveredDate && entries[hoveredDate] && (
        <div className="heatmap-tooltip">
          <div className="tooltip-date">{formatDate(hoveredDate)}</div>
          <div className="tooltip-stats">
            {entries[hoveredDate].practice?.leetcode?.length > 0 && (
              <span>💻 {entries[hoveredDate].practice.leetcode.length} LeetCode</span>
            )}
            {entries[hoveredDate].building?.length > 0 && (
              <span>🔨 {entries[hoveredDate].building.length} building</span>
            )}
            {entries[hoveredDate].reading?.length > 0 && (
              <span>📚 {entries[hoveredDate].reading.length} reading</span>
            )}
          </div>
        </div>
      )}
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="legend-boxes">
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} className={`legend-box intensity-${level}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default HeatmapCalendar

