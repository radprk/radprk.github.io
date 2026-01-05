import { useMemo } from 'react'

function TopicsCloud({ stats }) {
  const topics = useMemo(() => {
    if (!stats?.exploring?.topics) return []

    const topicsObj = stats.exploring.topics
    const entries = Object.entries(topicsObj)

    // Sort by count descending
    entries.sort((a, b) => b[1] - a[1])

    const maxCount = Math.max(...entries.map(([, c]) => c))

    return entries.map(([topic, count]) => ({
      topic,
      count,
      size: 0.7 + (count / maxCount) * 0.6 // Scale from 0.7 to 1.3rem
    }))
  }, [stats])

  if (topics.length === 0) return null

  return (
    <section className="topics-cloud card">
      <h2>Exploring</h2>
      <div className="cloud">
        {topics.map(({ topic, count, size }) => (
          <span
            key={topic}
            className="topic-bubble"
            style={{ fontSize: `${size}rem` }}
            title={`${count} entries`}
          >
            {topic}
            <span className="count">{count}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

export default TopicsCloud
