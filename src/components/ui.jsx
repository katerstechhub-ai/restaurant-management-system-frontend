import { colors, font, radius } from '../styles/tokens';

export function Card({ children, style }) {
  return (
    <div
      style={{
        background: colors.panel,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        padding: '20px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', style, ...rest }) {
  const base = {
    fontFamily: font.body,
    fontWeight: 600,
    fontSize: '14px',
    padding: '12px 20px',
    borderRadius: radius.pill,
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.15s ease',
  };
  const variants = {
    primary: { background: colors.accent, color: '#fff' },
    ghost: { background: 'transparent', color: colors.textPrimary, border: `1px solid ${colors.border}` },
    dark: { background: '#000', color: '#fff' },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {children}
    </button>
  );
}

export function Input({ label, style, wrapperStyle, ...rest }) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '13px',
        color: colors.textMuted,
        width: '100%',
        minWidth: 0,
        flex: 1,
        ...wrapperStyle,
      }}
    >
      {label}
      <input
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: colors.panelAlt,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          padding: '12px 14px',
          color: colors.textPrimary,
          fontSize: '14px',
          fontFamily: font.body,
          outline: 'none',
          ...style,
        }}
        {...rest}
      />
    </label>
  );
}

export function Select({ label, children, style, wrapperStyle, ...rest }) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '13px',
        color: colors.textMuted,
        width: '100%',
        minWidth: 0,
        flex: 1,
        ...wrapperStyle,
      }}
    >
      {label}
      <select
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: colors.panelAlt,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.sm,
          padding: '12px 14px',
          color: colors.textPrimary,
          fontSize: '14px',
          fontFamily: font.body,
          outline: 'none',
          ...style,
        }}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

export function StatusPill({ status, color }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: radius.pill,
        fontSize: '12px',
        fontWeight: 600,
        color: '#141414',
        background: color,
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  );
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <div style={{ color: colors.danger, fontSize: '13px' }}>{children}</div>;
}

export function PageTitle({ children }) {
  return (
    <h1 style={{ fontFamily: font.display, fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>
      {children}
    </h1>
  );
}