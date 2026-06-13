import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    if (import.meta.env.VITE_SENTRY_DSN) {
      void import('@sentry/react').then(Sentry => {
        Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
      }).catch(() => {});
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, background: 'var(--bg-color, #0c0c0e)',
        }}>
          <div style={{
            maxWidth: 420, width: '100%', padding: 28, borderRadius: 20,
            background: 'var(--card-bg, #fff)', border: '3px solid var(--dark-border, #000)',
            boxShadow: '0 8px 0 var(--dark-border, #000)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😵</div>
            <h1 style={{ fontWeight: 900, fontSize: 22, margin: '0 0 8px' }}>Bir şeyler ters gitti</h1>
            <p style={{ color: 'var(--text-muted, #666)', fontSize: 14, margin: '0 0 20px', lineHeight: 1.5 }}>
              Beklenmeyen bir hata oluştu. Sayfayı yenilemeyi deneyin.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px', borderRadius: 14, fontWeight: 900, fontSize: 14,
                background: '#7B6EF6', color: '#fff', border: '3px solid #000',
                cursor: 'pointer',
              }}
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
