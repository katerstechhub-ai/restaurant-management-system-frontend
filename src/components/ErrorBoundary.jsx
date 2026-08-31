import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import { colors, font, radius } from '../styles/tokens';

// Without this, any uncaught error anywhere in the tree (e.g. a page
// mapping over data the backend hasn't shaped the way the frontend
// expects yet) unmounts the whole app to a blank white screen — which is
// what was happening on Floor Plan. This catches it at the route level so
// one broken page shows an error card instead of taking down navigation,
// the sidebar, everything.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught error in route:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: colors.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '420px',
              textAlign: 'center',
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.md,
              padding: '32px 24px',
            }}
          >
            <AlertTriangle size={28} color={colors.danger} />
            <h2 style={{ fontFamily: font.display, fontSize: '17px', margin: '14px 0 8px', color: colors.textPrimary }}>
              Something went wrong on this page
            </h2>
            <p style={{ color: colors.textMuted, fontSize: '13px', margin: '0 0 18px' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.assign('/menu')}
              style={{
                background: colors.accent,
                color: '#fff',
                border: 'none',
                borderRadius: radius.pill,
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Back to menu
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}