function BookProgress({ bookKey, data }) {
  const bookNames = {
    DDIA: 'Designing Data-Intensive Applications',
    AI_Engineering: 'AI Engineering',
  }

  const name = bookNames[bookKey] || bookKey
  const percentage = data.percentage || 0
  const pagesRead = data.pages_read || 0
  const totalPages = data.total_pages || 0
  const chapters = data.chapters_completed || []
  const themes = data.themes_covered || []

  return (
    <div className="book-progress">
      <div className="book-header">
        <span className="book-name">{name}</span>
        <span className="book-percent">{percentage}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      <div className="book-details">
        <span className="pages">{pagesRead} / {totalPages} pages</span>
        {chapters.length > 0 && (
          <span className="chapters">
            Ch {chapters.join(', ')} complete
          </span>
        )}
      </div>
      {themes.length > 0 && (
        <div className="themes">
          {themes.slice(0, 5).map((theme, i) => (
            <span key={i} className="theme-tag">{theme}</span>
          ))}
          {themes.length > 5 && (
            <span className="theme-more">+{themes.length - 5}</span>
          )}
        </div>
      )}
    </div>
  )
}

function ReadingProgress({ stats }) {
  if (!stats?.reading) return null

  const books = Object.entries(stats.reading)

  if (books.length === 0) return null

  return (
    <section className="reading-progress card">
      <h2>Reading Progress</h2>
      <div className="books-list">
        {books.map(([key, data]) => (
          <BookProgress key={key} bookKey={key} data={data} />
        ))}
      </div>
    </section>
  )
}

export default ReadingProgress
