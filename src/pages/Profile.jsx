import { User as UserIcon, Mail, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { colors, font, radius } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, Button, PageTitle } from '../components/ui';

function Row({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: `1px solid ${colors.border}` }}>
      <div style={{
        width: 36, height: 36, borderRadius: radius.sm, background: colors.panelAlt,
        display: 'grid', placeItems: 'center', flexShrink: 0, color: colors.textMuted,
      }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: colors.textMuted, fontSize: '12px' }}>{label}</div>
        <div style={{ fontWeight: 600, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <AppLayout title="Profile">
      <PageTitle subtitle="Your account details">Profile</PageTitle>

      <div style={{ maxWidth: 480 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: colors.accent,
              display: 'grid', placeItems: 'center', flexShrink: 0,
              fontFamily: font.display, fontWeight: 700, color: '#fff', fontSize: '18px',
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: '17px' }}>{user.name}</div>
              <div style={{ color: colors.textMuted, fontSize: '12px', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
          </div>

          <Row icon={UserIcon} label="Name" value={user.name} />
          <Row icon={Mail} label="Email" value={user.email} />
          <Row icon={Shield} label="Role" value={<span style={{ textTransform: 'capitalize' }}>{user.role}</span>} />

          <div style={{ marginTop: '20px' }}>
            <Button variant="ghost" onClick={logout} style={{ color: colors.accent }}>
              <LogOut size={15} /> Log out
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}