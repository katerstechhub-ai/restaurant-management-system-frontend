import { NavLink } from 'react-router-dom';
import {
  UtensilsCrossed, PencilLine, ShoppingCart, ClipboardList,
  CreditCard, Receipt, LogOut, Flame, Settings, Bell,
  CalendarDays, Grid, ChefHat, Package
} from 'lucide-react';
import { colors, font, radius, shadow } from '../styles/tokens';
import { useAuth } from '../context/AuthContext';

// Exported so AdminLayout can reuse the same list for its mobile drawer/header.
export const NAV_ITEMS = [
  { to: '/menu', label: 'Menu', Icon: UtensilsCrossed, roles: ['admin', 'staff', 'customer'] },
  { to: '/menu-admin', label: 'Manage Menu', Icon: PencilLine, roles: ['admin'] },
  { to: '/order', label: 'Order', Icon: ShoppingCart, roles: ['customer'] },
  { to: '/reservations', label: 'Reservations', Icon: CalendarDays, roles: ['customer'] },
  { to: '/floor-plan', label: 'Floor Plan', Icon: Grid, roles: ['admin', 'staff'] },
  { to: '/orders', label: 'Orders', Icon: ClipboardList, roles: ['admin', 'staff'] },
  { to: '/kitchen', label: 'Kitchen', Icon: ChefHat, roles: ['admin', 'staff'] },
  { to: '/checkout', label: 'Checkout', Icon: CreditCard, roles: ['admin', 'staff'] },
  { to: '/transactions', label: 'Transactions', Icon: Receipt, roles: ['admin', 'staff', 'customer'] },
  { to: '/inventory', label: 'Inventory', Icon: Package, roles: ['admin', 'staff'] },
];

function NavItem({ item }) {
  const { Icon, label, to } = item;
  return (
    <NavLink
      to={to}
      title={label}
      style={({ isActive }) => ({
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '11px 14px',
        borderRadius: radius.sm,
        textDecoration: 'none',
        color: isActive ? colors.accent : colors.textMuted,
        background: isActive ? colors.accentSoft : 'transparent',
        fontFamily: font.body,
        fontSize: '13px',
        fontWeight: isActive ? 700 : 500,
        transition: 'all .15s ease',
      })}
    >
      {({ isActive }) => (
        <>
          <Icon size={18} strokeWidth={2} />
          <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
          {isActive && (
            <span
              style={{
                position: 'absolute',
                right: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: colors.accent,
              }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const items = NAV_ITEMS.filter((i) => user && i.roles.includes(user.role));

  const iconBtn = {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: `1px solid ${colors.border}`,
    background: colors.panelAlt,
    color: colors.textMuted,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <aside
      style={{
        width: '224px',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        padding: '26px 16px',
        display: 'flex',
        flexDirection: 'column',
        background: colors.panel,
        borderRight: `1px solid ${colors.border}`,
        borderRadius: `${radius.lg} 0 0 ${radius.lg}`,
        backdropFilter: 'blur(18px)',
        fontFamily: font.body,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '34px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: `linear-gradient(140deg, ${colors.accent}, #ff8a3d)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: shadow.glow,
          }}
        >
          <Flame size={22} color="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontFamily: font.display, fontWeight: 700, color: colors.text, fontSize: '15px' }}>Rustico</div>
          <div style={{ color: colors.textMuted, fontSize: '11px', textTransform: 'capitalize' }}>
            {user ? user.role : 'Guest'}
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {items.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '18px', borderTop: `1px solid ${colors.border}` }}>
        <button style={iconBtn} title="Settings"><Settings size={17} /></button>
        <button style={iconBtn} title="Notifications"><Bell size={17} /></button>
        <button
          onClick={logout}
          title="Log out"
          style={{ ...iconBtn, marginLeft: 'auto', background: colors.accentSoft, color: colors.accent, borderColor: 'transparent' }}
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}