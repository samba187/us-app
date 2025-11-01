import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // Could send to monitoring
    // console.error('ErrorBoundary', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:20, fontFamily:'system-ui'}}>
          <h2>Oups, une erreur est survenue</h2>
          <p>Rechargez la page ou réessayez plus tard.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;


