import { useMemo } from 'react'
import './WordCloud.css'

function WordCloud({ entries, stats }) {
  if (!entries) return null

  // Extract words from entries (insights, notes, exploring content)
  const wordData = useMemo(() => {
    const wordMap = new Map()
    
    Object.values(entries).forEach(entry => {
      // From practice insights
      if (entry.practice) {
        Object.values(entry.practice).forEach(items => {
          items.forEach(item => {
            if (item.insight) {
              extractWords(item.insight, wordMap)
            }
          })
        })
      }
      
      // From reading insights
      if (entry.reading) {
        entry.reading.forEach(item => {
          if (item.insight) {
            extractWords(item.insight, wordMap)
          }
        })
      }
      
      // From exploring content
      if (entry.exploring) {
        entry.exploring.forEach(item => {
          if (item.content) {
            extractWords(item.content, wordMap)
          }
        })
      }
      
      // From notes
      if (entry.notes) {
        extractWords(entry.notes, wordMap)
      }
    })
    
    // Convert to array and sort by frequency
    return Array.from(wordMap.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50) // Top 50 words
  }, [entries])

  // Also include exploring topics
  const topics = stats?.exploring?.topics || {}
  const topicData = Object.entries(topics)
    .map(([topic, count]) => ({ word: topic, count }))
    .sort((a, b) => b.count - a.count)

  const allWords = [...wordData, ...topicData]
  const maxCount = Math.max(...allWords.map(w => w.count), 1)
  const minCount = Math.min(...allWords.map(w => w.count), 1)

  const getSize = (count) => {
    if (maxCount === minCount) return 1
    const normalized = (count - minCount) / (maxCount - minCount)
    return 0.7 + normalized * 1.5 // Range from 0.7rem to 2.2rem
  }

  const getColor = (count) => {
    const normalized = (count - minCount) / (maxCount - minCount)
    if (normalized > 0.7) return 'var(--accent)'
    if (normalized > 0.4) return 'var(--accent-dim)'
    return 'var(--text-muted)'
  }

  return (
    <div className="word-cloud">
      <h2>Word Cloud</h2>
      <p className="section-subtitle">Most mentioned concepts and topics</p>
      <div className="cloud-container">
        {allWords.map((item, idx) => (
          <span
            key={idx}
            className="cloud-word"
            style={{
              fontSize: `${getSize(item.count)}rem`,
              color: getColor(item.count),
              fontWeight: item.count > maxCount * 0.5 ? 600 : 400
            }}
          >
            {item.word}
          </span>
        ))}
      </div>
    </div>
  )
}

function extractWords(text, wordMap) {
  // Remove common stop words and extract meaningful words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
    'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now'
  ])
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
  
  words.forEach(word => {
    wordMap.set(word, (wordMap.get(word) || 0) + 1)
  })
}

export default WordCloud

