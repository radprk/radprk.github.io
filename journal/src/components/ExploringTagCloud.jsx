import { useState } from 'react'
import './ExploringTagCloud.css'

function ExploringTagCloud({ stats, onTopicClick }) {
  const [selectedTopic, setSelectedTopic] = useState(null)

  if (!stats?.exploring?.topics) return null

  const topics = Object.entries(stats.exploring.topics)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)

  if (topics.length === 0) return null

  const maxCount = Math.max(...topics.map(t => t.count))
  const minCount = Math.min(...topics.map(t => t.count))

  const getSize = (count) => {
    if (maxCount === minCount) return 1
    const normalized = (count - minCount) / (maxCount - minCount)
    return 0.7 + normalized * 1.3 // Range from 0.7x to 2x
  }

  const handleClick = (topic) => {
    if (selectedTopic === topic) {
      setSelectedTopic(null)
      if (onTopicClick) onTopicClick(null)
    } else {
      setSelectedTopic(topic)
      if (onTopicClick) onTopicClick(topic)
    }
  }

  return (
    <div className="exploring-tag-cloud">
      <h2>Exploring</h2>
      <p className="section-subtitle">Topics I've been curious about</p>
      <div className="tag-cloud">
        {topics.map(({ topic, count }) => (
          <button
            key={topic}
            className={`tag-item ${selectedTopic === topic ? 'selected' : ''}`}
            style={{ fontSize: `${getSize(count)}rem` }}
            onClick={() => handleClick(topic)}
          >
            {topic}
            <span className="tag-count">{count}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ExploringTagCloud

