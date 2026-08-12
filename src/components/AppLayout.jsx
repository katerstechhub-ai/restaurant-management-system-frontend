import Sidebar from './Sidebar';
import { colors, font } from '../styles/tokens';

export default function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg, fontFamily: font.body }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '32px 40px', color: colors.textPrimary }}>{children}</div>
    </div>
  );
}
