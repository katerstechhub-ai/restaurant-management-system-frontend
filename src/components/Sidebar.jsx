import { NavLink } from 'react-router-dom';
import { UtensilsCrossed, PencilLine, ShoppingCart, ClipboardList, CreditCard, Receipt, LogOut } from 'lucide-react';
import { colors, font } from '../styles/tokens';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/menu', label: 'Menu', Icon: UtensilsCrossed, roles: ['admin', 'staff', 'customer'] },
  { to: '/menu-admin', label: 'Manage Menu', Icon: PencilLine, roles: ['admin'] },
  { to: '/order', label: 'Order', Icon: ShoppingCart, roles: ['customer'] },
  { to: '/orders', label: 'Orders', Icon: ClipboardList, roles: ['admin', 'staff'] },
  { to: '/checkout', label: 'Checkout', Icon: CreditCard, roles: ['admin', 'staff'] },
  { to: '/transactions', label: 'Transactions', Icon: Receipt, roles: ['admin', 'staff', 'customer'] },
];

function renderNavLinks(items) {
  const links = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const Icon = item.Icon;
    links.push(
      <NavLink
        key={item.to}
        to={item.to}
        style={({ isActive }) => ({
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          background: isActive ? colors.accent : 'transparent',
          color: isActive ? '#fff' : colors.textMuted,
          transition: 'background 0.15s ease',
        })}
        title={item.label}
      >
        <Icon size={20} strokeWidth={2} />
      </NavLink>
    );
  }
  return links;
}

export default function Sidebar() {
  const { user, logout } = useAuth();

  const items = [];
  for (let i = 0; i < NAV_ITEMS.length; i++) {
    const item = NAV_ITEMS[i];
    if (user && item.roles.indexOf(user.role) !== -1) {
      items.push(item);
    }
  }

  return (
    <div
      style={{
        width: '84px',
        background: colors.panel,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 0',
        height: '100vh',
        position: 'sticky',
        top: 0,
        fontFamily: font.body,
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: colors.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: font.display,
          fontWeight: 700,
          color: '#fff',
          marginBottom: '32px',
        }}
      >
        R
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        {renderNavLinks(items)}
      </div>

      <button
        onClick={logout}
        title="Log out"
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: 'none',
          background: colors.panelAlt,
          color: colors.textMuted,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LogOut size={18} strokeWidth={2} />
      </button>
    </div>
  );
}