import { colors, font, radius, shadow } from '../styles/tokens';

export function Card({ children, style, hover = false, ...rest }) {
  return (
    <div
      {...rest}
      style={{
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        padding: '18px',
        boxShadow: shadow.card,
        backdropFilter: 'blur(14px)',
        transition: 'transform .18s ease, border-color .18s ease',
        ...style,
      }}
      onMouseEnter={hover ? (e) => (e.currentTarget.style.transform = 'translateY(-3px)') : undefined}
      onMouseLeave={hover ? (e) => (e.currentTarget.style.transform = 'translateY(0)') : undefined}
    >
      {children}
    </div>
  );
}

export function Button({ variant = 'solid', style, children, ...rest }) {
  const base = {
    fontFamily: font.body,
    fontSize: '13px',
    fontWeight: 600,
    borderRadius: radius.pill,
    padding: '10px 18px',
    cursor: 'pointer',
    border: '1px solid transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all .15s ease',
  };
  const variants = {
    solid: { background: colors.accent, color: '#fff', boxShadow: shadow.glow },
    ghost: { background: 'transparent', color: colors.text, borderColor: colors.border },
    soft: { background: colors.panelAlt, color: colors.text },
    dark: { background: '#1f1f1f', color: '#fff', border: `1px solid ${colors.border}` },
  };
  return (
    <button {...rest} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label style={{ display: 'block', fontFamily: font.body }}>
      {label ? (
        <span style={{ display: 'block', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '6px' }}>
          {label}
        </span>
      ) : null}
      {children}
    </label>
  );
}

const controlStyle = {
  width: '100%',
  background: 'rgba(20,20,20,0.8)',
  border: `1px solid ${colors.border}`,
  borderRadius: radius.sm,
  padding: '11px 14px',
  color: colors.text,
  fontSize: '13px',
  fontFamily: font.body,
  outline: 'none',
};

export function Input({ label, style, ...rest }) {
  return (
    <Field label={label}>
      <input {...rest} style={{ ...controlStyle, ...style }} />
    </Field>
  );
}

export function Select({ label, style, children, ...rest }) {
  return (
    <Field label={label}>
      <select {...rest} style={{ ...controlStyle, appearance: 'none', ...style }}>
        {children}
      </select>
    </Field>
  );
}

export function StatusPill({ status, color }) {
  return (
    <span
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}55`,
        borderRadius: radius.pill,
        padding: '4px 12px',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}

export function PageTitle({ children, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px', gap: '16px' }}>
      <div>
        <h1 style={{ fontFamily: font.display, fontSize: '22px', fontWeight: 700, color: colors.text, margin: 0 }}>{children}</h1>
        {subtitle ? <p style={{ color: colors.textMuted, fontSize: '13px', margin: '6px 0 0' }}>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ErrorText({ children }) {
  if (!children) return null;
  return (
    <div style={{ color: colors.accent, fontSize: '13px', margin: '10px 0', fontFamily: font.body }}>{children}</div>
  );
}

export function EmptyState({ icon: Icon, title, hint }) {
  return (
    <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
      {Icon ? <Icon size={28} color={colors.textMuted} /> : null}
      <div style={{ marginTop: '12px', fontWeight: 600, color: colors.text }}>{title}</div>
      {hint ? <div style={{ color: colors.textMuted, fontSize: '13px', marginTop: '6px' }}>{hint}</div> : null}
    </Card>
  );
}

export function Thumb({ src, alt, size = 56, radiusPx = 14 }) {
  return src ? (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      style={{ width: size, height: size, objectFit: 'cover', borderRadius: radiusPx, border: `1px solid ${colors.border}`, flexShrink: 0 }}
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radiusPx,
        background: colors.panelAlt,
        border: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.textMuted,
        fontSize: '10px',
        flexShrink: 0,
      }}
    >
      No img
    </div>
  );
}
