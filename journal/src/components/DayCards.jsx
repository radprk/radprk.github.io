import { useState, useEffect } from 'react'
import './DayCards.css'

function DayCards({ entries, filterTopic = null }) {
  const [filter, setFilter] = useState('all')
  const [expandedDays, setExpandedDays] = useState(new Set())

  useEffect(() => {
    // Auto-expand today's entry if it exists
    const today = new Date().toISOString().split('T')[0]
    if (entries && entries[today]) {
      setExpandedDays(new Set([today]))
    }
  }, [entries])

  if (!entries) return null

  const sortedDates = Object.keys(entries).sort().reverse()

  const toggleDay = (date) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDays(newExpanded)
  }

  const filterEntries = (date, entry) => {
    if (filter === 'all') {
      if (filterTopic) {
        // Filter by exploring topic
        return entry.exploring?.some(e => e.topic === filterTopic)
      }
      return true
    }
    
    if (filter === 'practice') {
      const practice = entry.practice || {}
      return Object.values(practice).some(arr => arr.length > 0)
    }
    
    if (filter === 'building') {
      return entry.building?.length > 0
    }
    
    if (filter === 'reading') {
      return entry.reading?.length > 0
    }
    
    if (filter === 'exploring') {
      return entry.exploring?.length > 0
    }
    
    return true
  }

  const filteredDates = sortedDates.filter(date => {
    const entry = entries[date]
    return filterEntries(date, entry)
  })

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPreview = (entry) => {
    const parts = []
    if (entry.practice?.leetcode?.length > 0) {
      parts.push(`💻 ${entry.practice.leetcode.length} LeetCode`)
    }
    if (entry.building?.length > 0) {
      parts.push(`🔨 ${entry.building.length} building`)
    }
    if (entry.reading?.length > 0) {
      parts.push(`📚 ${entry.reading.length} reading`)
    }
    if (entry.exploring?.length > 0) {
      parts.push(`🔍 ${entry.exploring.length} exploring`)
    }
    if (entry.notes) {
      parts.push('📝 notes')
    }
    return parts.length > 0 ? parts.join(' • ') : 'No activity'
  }

  return (
    <div className="day-cards">
      <div className="day-cards-header">
        <h2>Daily Entries</h2>
        <div className="filter-buttons">
          {['all', 'practice', 'building', 'reading', 'exploring'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filterTopic && (
        <div className="topic-filter-indicator">
          Filtering by: <strong>{filterTopic}</strong>
          <button onClick={() => window.location.reload()}>Clear</button>
        </div>
      )}

      <div className="cards-list">
        {filteredDates.length === 0 ? (
          <div className="no-entries">No entries found for this filter.</div>
        ) : (
          filteredDates.map(date => {
            const entry = entries[date]
            const isExpanded = expandedDays.has(date)
            
            return (
              <div
                key={date}
                id={`day-card-${date}`}
                className={`day-card ${isExpanded ? 'expanded' : ''}`}
              >
                <div className="day-card-header" onClick={() => toggleDay(date)}>
                  <div className="day-card-date">
                    <span className="date-text">{formatDate(date)}</span>
                    <span className="day-name">{entry.day}</span>
                  </div>
                  <div className="day-card-preview">
                    {getPreview(entry)}
                  </div>
                  <div className="day-card-toggle">
                    {isExpanded ? '−' : '+'}
                  </div>
                </div>

                {isExpanded && (
                  <div className="day-card-content">
                    {entry.practice && (
                      (entry.practice.leetcode?.length > 0 ||
                       entry.practice.sql?.length > 0 ||
                       entry.practice.system_design?.length > 0 ||
                       entry.practice.ml?.length > 0) && (
                        <div className="section practice-section">
                          <h3 className="section-title">💻 Practice</h3>
                          {entry.practice.leetcode?.length > 0 && (
                            <div className="practice-category">
                              <h4>LeetCode</h4>
                              <ul>
                                {entry.practice.leetcode.map((item, idx) => (
                                  <li key={idx}>
                                    <span className="problem-name">{item.name}</span>
                                    {item.difficulty && (
                                      <span className={`difficulty ${item.difficulty}`}>
                                        {item.difficulty}
                                      </span>
                                    )}
                                    {item.insight && (
                                      <div className="insight">{item.insight}</div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {entry.practice.sql?.length > 0 && (
                            <div className="practice-category">
                              <h4>SQL</h4>
                              <ul>
                                {entry.practice.sql.map((item, idx) => (
                                  <li key={idx}>
                                    <span className="problem-name">{item.name}</span>
                                    {item.insight && (
                                      <div className="insight">{item.insight}</div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {entry.practice.system_design?.length > 0 && (
                            <div className="practice-category">
                              <h4>System Design</h4>
                              <ul>
                                {entry.practice.system_design.map((item, idx) => (
                                  <li key={idx}>
                                    <span className="problem-name">{item.name}</span>
                                    {item.type && (
                                      <span className="type-tag">{item.type}</span>
                                    )}
                                    {item.insight && (
                                      <div className="insight">{item.insight}</div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {entry.practice.ml?.length > 0 && (
                            <div className="practice-category">
                              <h4>ML</h4>
                              <ul>
                                {entry.practice.ml.map((item, idx) => (
                                  <li key={idx}>
                                    <span className="problem-name">{item.name}</span>
                                    {item.insight && (
                                      <div className="insight">{item.insight}</div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )
                    )}

                    {entry.building?.length > 0 && (
                      <div className="section building-section">
                        <h3 className="section-title">🔨 Building</h3>
                        <ul>
                          {entry.building.map((item, idx) => (
                            <li key={idx}>
                              <span className="project-name">{item.project}</span>
                              <div className="work-desc">{item.work}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.reading?.length > 0 && (
                      <div className="section reading-section">
                        <h3 className="section-title">📚 Reading</h3>
                        <ul>
                          {entry.reading.map((item, idx) => (
                            <li key={idx}>
                              <span className="book-name">{item.book}</span>
                              {item.chapter && (
                                <span className="chapter-info">Ch {item.chapter}</span>
                              )}
                              {item.pages && (
                                <span className="pages-info">
                                  (pages {item.pages[0]}-{item.pages[1]})
                                </span>
                              )}
                              {item.insight && (
                                <div className="insight">{item.insight}</div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.exploring?.length > 0 && (
                      <div className="section exploring-section">
                        <h3 className="section-title">🔍 Exploring</h3>
                        <ul>
                          {entry.exploring.map((item, idx) => (
                            <li key={idx}>
                              <span className="topic-name">{item.topic}</span>
                              <div className="exploring-content">{item.content}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.notes && (
                      <div className="section notes-section">
                        <h3 className="section-title">📝 Notes</h3>
                        <div className="notes-content">{entry.notes}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default DayCards

