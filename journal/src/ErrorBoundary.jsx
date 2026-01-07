import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          background: '#0a0a0b',
          color: '#e4e4e7',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h1 style={{ color: '#5eead4', marginBottom: '16px' }}>Something went wrong</h1>
          <p style={{ color: '#71717a', marginBottom: '24px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#5eead4',
              color: '#0a0a0b',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 500
            }}
          >
            Reload Page
          </button>
          <details style={{ marginTop: '24px', color: '#71717a', fontSize: '0.9rem' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>Error details</summary>
            <pre style={{
              background: '#141416',
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              maxWidth: '600px',
              fontSize: '0.85rem'
            }}>
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

