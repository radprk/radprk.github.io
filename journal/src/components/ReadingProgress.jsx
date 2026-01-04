import './ReadingProgress.css'

function ReadingProgress({ stats, books }) {
  if (!stats?.reading || !books) return null

  const readingData = Object.entries(stats.reading).map(([bookKey, data]) => {
    const bookInfo = books[bookKey]
    if (!bookInfo) return null

    // Calculate chapter progress
    const chapters = bookInfo.chapters || {}
    const completedChapters = data.chapters_completed || []
    
    // Find current chapter (first incomplete)
    let currentChapter = null
    for (const [chNum, chInfo] of Object.entries(chapters)) {
      if (!completedChapters.includes(parseInt(chNum))) {
        currentChapter = { num: chNum, ...chInfo }
        break
      }
    }

    return {
      key: bookKey,
      title: bookInfo.full_title,
      author: bookInfo.author,
      pagesRead: data.pages_read || 0,
      totalPages: bookInfo.total_pages,
      percentage: data.percentage || 0,
      themes: data.themes_covered || [],
      currentChapter,
      completedChapters
    }
  }).filter(Boolean)

  if (readingData.length === 0) return null

  return (
    <div className="reading-progress">
      <h2>Reading Progress</h2>
      <div className="books-list">
        {readingData.map(book => (
          <div key={book.key} className="book-card">
            <div className="book-header">
              <h3 className="book-title">{book.title}</h3>
              <span className="book-author">{book.author}</span>
            </div>
            
            <div className="book-progress">
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${book.percentage}%` }}
                />
              </div>
              <div className="progress-text">
                <span>{book.pagesRead} / {book.totalPages} pages</span>
                <span className="progress-percentage">{book.percentage.toFixed(1)}%</span>
              </div>
            </div>

            {book.currentChapter && (
              <div className="current-chapter">
                <span className="chapter-label">Current:</span>
                <span className="chapter-name">
                  Ch {book.currentChapter.num}: {book.currentChapter.title}
                </span>
                <span className="chapter-pages">
                  ({book.currentChapter.pages[0]}-{book.currentChapter.pages[1]})
                </span>
              </div>
            )}

            {book.themes.length > 0 && (
              <div className="themes-tags">
                {book.themes.slice(0, 8).map((theme, idx) => (
                  <span key={idx} className="theme-tag">{theme}</span>
                ))}
                {book.themes.length > 8 && (
                  <span className="theme-tag more">+{book.themes.length - 8} more</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReadingProgress

