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
};

export const font = {
  display: "'Space Grotesk', sans-serif",
  body: "'Inter', sans-serif",
};

export const radius = {
  sm: '8px',
  md: '14px',
  lg: '20px',
  pill: '999px',
};

export const spacing = (n) => `${n * 4}px`;

export const statusColor = (status) => {
  if (status === 'completed' || status === 'paid') return colors.success;
  if (status === 'pending') return colors.pending;
  if (status === 'in-progress') return colors.accentSecondary;
  if (status === 'failed') return colors.danger;
  return colors.textMuted;
};
