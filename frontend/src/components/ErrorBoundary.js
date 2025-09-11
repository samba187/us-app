import React from 'react';

// Simple Error Boundary to catch rendering errors and display fallback UI
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You could send this to a logging service
    // eslint-disable-next-line no-console
    console.error('🔥 Render error caught by ErrorBoundary:', error, info);
    this.setState({ info });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, info: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
          <h2>😵 Une erreur est survenue</h2>
          <p style={{ fontSize: 14, color: '#555' }}>Essayez de recharger l'application.</p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 10, borderRadius: 8, fontSize: 11 }}>
{this.state.error && (this.state.error.message || String(this.state.error))}
          </pre>
          {this.state.info && this.state.info.componentStack && (
            <details style={{ marginTop: 10 }}>
              <summary>Stack technique</summary>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#fafafa', padding: 10, borderRadius: 8, fontSize: 11 }}>
{this.state.info.componentStack}
              </pre>
            </details>
          )}
          <button onClick={this.handleReset} style={{ marginTop: 15, padding: '10px 16px', background: '#ff6b8a', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Recharger
          </button>
          <button onClick={() => { localStorage.clear(); sessionStorage.clear(); this.handleReset(); }} style={{ marginLeft: 10, marginTop: 15, padding: '10px 16px', background: '#4ecdc4', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Réinitialiser stockage
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
