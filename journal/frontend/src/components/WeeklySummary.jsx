import { useState, useMemo } from 'react'

function TopicModal({ topic, onClose }) {
  if (!topic) return null

  const typeLabels = {
    leetcode: 'LeetCode',
    system_design: 'System Design',
    reading: 'Reading',
    exploring: 'Exploring',
    building: 'Building'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="modal-header">
          <span className={`topic-type ${topic.type}`}>
            {typeLabels[topic.type] || topic.type}
          </span>
          <h2>{topic.name}</h2>
        </div>

        <div className="modal-body">
          {topic.items?.map((item, idx) => (
            <div key={idx} className="topic-item">
              {topic.type === 'leetcode' && (
                <>
                  <div className="item-header">
                    <span className="item-name">{item.name}</span>
                    {item.difficulty && (
                      <span className={`difficulty ${item.difficulty}`}>
                        {item.difficulty}
                      </span>
                    )}
                  </div>
                  {item.insight && (
                    <p className="item-insight">{item.insight}</p>
                  )}
                  <span className="item-date">{item.date}</span>
                </>
              )}

              {topic.type === 'system_design' && (
                <>
                  <div className="item-header">
                    <span className="item-name">{item.name}</span>
                    {item.type && (
                      <span className="design-type">{item.type}</span>
                    )}
                  </div>
                  {item.insight && (
                    <p className="item-insight">{item.insight}</p>
                  )}
                  <span className="item-date">{item.date}</span>
                </>
              )}

              {topic.type === 'reading' && (
                <>
                  <div className="item-header">
                    <span className="item-name">
                      {item.chapter ? `Chapter ${item.chapter}` : 'Reading'}
                    </span>
                    {item.pages && (
                      <span className="pages">
                        pp. {item.pages[0]}-{item.pages[1]}
                      </span>
                    )}
                  </div>
                  {item.insight && (
                    <p className="item-insight">{item.insight}</p>
                  )}
                  <span className="item-date">{item.date}</span>
                </>
              )}

              {topic.type === 'exploring' && (
                <>
                  <p className="item-content">{item.content}</p>
                  <span className="item-date">{item.date}</span>
                </>
              )}

              {topic.type === 'building' && (
                <>
                  <div className="item-header">
                    <span className="item-name">{item.project}</span>
                  </div>
                  {item.work && (
                    <p className="item-insight">{item.work}</p>
                  )}
                  <span className="item-date">{item.date}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function WeeklySummary({ summaries }) {
  const [selectedTopic, setSelectedTopic] = useState(null)

  // Get current week's summary (most recent)
  const currentSummary = useMemo(() => {
    if (!summaries || Object.keys(summaries).length === 0) return null

    const weekIds = Object.keys(summaries).sort().reverse()
    return summaries[weekIds[0]]
  }, [summaries])

  if (!currentSummary) {
    return null
  }

  const { narrative, topics } = currentSummary

  // Group topics by type for better display
  const topicsByType = useMemo(() => {
    if (!topics) return {}
    return topics.reduce((acc, topic) => {
      const type = topic.type
      if (!acc[type]) acc[type] = []
      acc[type].push(topic)
      return acc
    }, {})
  }, [topics])

  // No icons - clean minimal design

  return (
    <section className="weekly-summary card">
      <h2>This Week</h2>

      {narrative && (
        <p className="narrative">{narrative}</p>
      )}

      <div className="topics-grid">
        {topics?.map((topic, idx) => (
          <button
            key={idx}
            className={`topic-pill ${topic.type}`}
            onClick={() => setSelectedTopic(topic)}
          >
            <span className="topic-name">{topic.name}</span>
            {topic.count > 1 && (
              <span className="topic-count">{topic.count}</span>
            )}
          </button>
        ))}
      </div>

      <TopicModal
        topic={selectedTopic}
        onClose={() => setSelectedTopic(null)}
      />
    </section>
  )
}

export default WeeklySummary
