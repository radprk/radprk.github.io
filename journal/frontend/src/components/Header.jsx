function Header({ theme, toggleTheme }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <a href="/" className="back-link">← Portfolio</a>
          <h1>Journal</h1>
          <p className="subtitle">Daily practice, reading, and exploration</p>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  )
}

export default Header
