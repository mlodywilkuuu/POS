import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('The Paper Studio render error:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', padding: 32, background: '#090d16', color: '#e8ebf4', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ color: '#ff8d8d' }}>The Paper Studio napotkało błąd</h1>
          <p>Aplikacja nie mogła się wyrenderować. Szczegóły błędu:</p>
          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 16, borderRadius: 8, background: '#171f2d', color: '#ffd0d0' }}>{this.state.error.message}</pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 16px', border: 0, borderRadius: 8, background: '#8069e7', color: 'white', cursor: 'pointer' }}>Odśwież aplikację</button>
        </main>
      )
    }
    return this.props.children
  }
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Nie znaleziono elementu #root w index.html')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
)
