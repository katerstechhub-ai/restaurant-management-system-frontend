export const colors = {
  bg: '#141414',
  panel: '#1f1f1f',
  panelAlt: '#262626',
  border: '#333333',
  accent: '#E1483C',
  accentSecondary: '#F2994A',
  textPrimary: '#F5F5F5',
  textMuted: '#8A8A8A',
  success: '#3DD598',
  pending: '#F2C94C',
  danger: '#EB5757',

  // --- additions used by the new UI ---
  card: '#232323',
  cardHover: '#2b2b2b',
  accentSoft: 'rgba(225,72,60,0.14)',
  successSoft: 'rgba(61,213,152,0.14)',
  pendingSoft: 'rgba(242,201,76,0.14)',
  overlay: 'rgba(0,0,0,0.6)',
  glass: 'rgba(38,38,38,0.72)',
};

// alias so older/newer components can use either name
colors.text = colors.textPrimary;
colors.warning = colors.pending;

export const font = {
  display: "'Space Grotesk', sans-serif",
  body: "'Inter', sans-serif",
};

export const radius = {
  sm: '8px',
  md: '14px',
  lg: '20px',
  xl: '28px',
  pill: '999px',
};

export const spacing = (n) => `${n * 4}px`;

export const shadow = {
  sm: '0 2px 8px rgba(0,0,0,0.35)',
  md: '0 8px 24px rgba(0,0,0,0.45)',
  glow: `0 8px 28px rgba(225,72,60,0.28)`,
};

export const statusColor = (status) => {
  if (status === 'completed' || status === 'paid') return colors.success;
  if (status === 'pending') return colors.pending;
  if (status === 'in-progress') return colors.accentSecondary;
  if (status === 'failed') return colors.danger;
  return colors.textMuted;
};
