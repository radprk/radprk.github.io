import { useState, useMemo } from 'react'

function DayCard({ date, entry }) {
  const [expanded, setExpanded] = useState(false)

  const practice = entry.practice || {}
  const allPractice = [
    ...((practice.leetcode || []).map(p => ({ ...p, type: 'leetcode' }))),
    ...((practice.sql || []).map(p => ({ ...p, type: 'sql' }))),
    ...((practice.system_design || []).map(p => ({ ...p, type: 'system_design' }))),
    ...((practice.ml || []).map(p => ({ ...p, type: 'ml' }))),
  ]

  const preview = useMemo(() => {
    const parts = []
    if (allPractice.length > 0) parts.push(`${allPractice.length} practice`)
    if (entry.reading?.length > 0) parts.push(`${entry.reading.length} reading`)
    if (entry.building?.length > 0) parts.push('building')
    if (entry.exploring?.length > 0) parts.push('exploring')
    return parts.join(' · ') || 'No entries'
  }, [allPractice, entry])

  const dateObj = new Date(date + 'T00:00:00')
  const dayName = entry.day || dateObj.toLocaleDateString('en-US', { weekday: 'long' })
  const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className={`day-card ${expanded ? 'expanded' : ''}`}>
      <div className="day-header" onClick={() => setExpanded(!expanded)}>
        <div className="day-date">
          <span className="day-name">{dayName}</span>
          <span className="date-formatted">{dateFormatted}</span>
        </div>
        <span className="day-preview">{preview}</span>
        <span className="expand-icon">{expanded ? '−' : '+'}</span>
      </div>

      {expanded && (
        <div className="day-content">
          {allPractice.length > 0 && (
            <div className="section practice">
              <h4>Practice</h4>
              <ul>
                {allPractice.map((item, i) => (
                  <li key={i} className={`practice-item ${item.type}`}>
                    <span className="practice-type">{item.type.replace('_', ' ')}</span>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="practice-name practice-link"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <span className="practice-name">{item.name}</span>
                    )}
                    {item.difficulty && (
                      <span className={`difficulty ${item.difficulty}`}>
                        {item.difficulty}
                      </span>
                    )}
                    {item.tags?.length > 0 && (
                      <span className="practice-tags">
                        {item.tags.slice(0, 3).map((tag, ti) => (
                          <span key={ti} className="practice-tag">{tag}</span>
                        ))}
                      </span>
                    )}
                    {item.insight && (
                      <p className="insight">{item.insight}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {entry.reading?.length > 0 && (
            <div className="section reading">
              <h4>Reading</h4>
              <ul>
                {entry.reading.map((item, i) => (
                  <li key={i}>
                    <span className="book">{item.book}</span>
                    {item.chapter && <span className="chapter">Ch {item.chapter}</span>}
                    {item.pages && (
                      <span className="pages">pp. {item.pages[0]}-{item.pages[1]}</span>
                    )}
                    {item.insight && <p className="insight">{item.insight}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {entry.building?.length > 0 && (
            <div className="section building">
              <h4>Building</h4>
              <ul>
                {entry.building.map((item, i) => (
                  <li key={i}>
                    <span className="project">{item.project}</span>
                    <p className="work">{item.work}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {entry.exploring?.length > 0 && (
            <div className="section exploring">
              <h4>Exploring</h4>
              <ul>
                {entry.exploring.map((item, i) => (
                  <li key={i}>
                    <span className="topic">{item.topic}</span>
                    <p className="content">{item.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {entry.notes && (
            <div className="section notes">
              <h4>Notes</h4>
              <p>{entry.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DayCards({ entries, filter, setFilter }) {
  const sortedDates = useMemo(() => {
    return Object.keys(entries).sort().reverse()
  }, [entries])

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'practice', label: 'Practice' },
    { key: 'reading', label: 'Reading' },
    { key: 'building', label: 'Building' },
    { key: 'exploring', label: 'Exploring' },
  ]

  const filteredDates = useMemo(() => {
    if (filter === 'all') return sortedDates

    return sortedDates.filter(date => {
      const entry = entries[date]
      switch (filter) {
        case 'practice':
          const p = entry.practice || {}
          return (p.leetcode?.length || 0) + (p.sql?.length || 0) +
                 (p.system_design?.length || 0) + (p.ml?.length || 0) > 0
        case 'reading':
          return entry.reading?.length > 0
        case 'building':
          return entry.building?.length > 0
        case 'exploring':
          return entry.exploring?.length > 0
        default:
          return true
      }
    })
  }, [sortedDates, entries, filter])

  return (
    <section className="day-cards card">
      <div className="cards-header">
        <h2>Daily Entries</h2>
        <div className="filters">
          {filters.map(f => (
            <button
              key={f.key}
              className={filter === f.key ? 'active' : ''}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cards-list">
        {filteredDates.map(date => (
          <DayCard key={date} date={date} entry={entries[date]} />
        ))}
      </div>

      {filteredDates.length === 0 && (
        <p className="no-entries">No entries match this filter.</p>
      )}
    </section>
  )
}

export default DayCards
