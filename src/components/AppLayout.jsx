import { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaHamburger } from 'react-icons/fa';
import {
  UtensilsCrossed, Wallet, Receipt, ShoppingCart, User,
  Menu as MenuIcon, X, LogOut, Settings, Bell,
} from 'lucide-react';
import { colors, font, radius, spacing, shadow } from '../styles/tokens';
import { useAuth } from '../context/AuthContext';

// Customer-facing nav only. Admin/staff use AdminLayout + Sidebar instead.
const NAV = [
  { to: '/menu', label: 'Menu', Icon: UtensilsCrossed },
  { to: '/order', label: 'Order', Icon: ShoppingCart },
  { to: '/wallet', label: 'Wallet', Icon: Wallet },
  { to: '/transactions', label: 'Transactions', Icon: Receipt },
  { to: '/profile', label: 'Profile', Icon: User },
];

function useIsMobile(bp = 900) {
  const [m, setM] = useState(
    typeof window !== 'undefined' ? window.innerWidth < bp : false
  );
  useEffect(() => {
    const on = () => setM(window.innerWidth < bp);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [bp]);
  return m;
}

function NavItem({ item, onClick }) {
  const { Icon, label, to } = item;
  return (
    <NavLink
      to={to}
      title={label}
      onClick={onClick}
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
            <span style={{
              position: 'absolute', right: '10px', width: '6px', height: '6px',
              borderRadius: '50%', background: colors.accent,
            }} />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function AppLayout({ title, action, children }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/');
  };

  useEffect(() => { if (!isMobile) setOpen(false); }, [isMobile]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const iconBtn = {
    width: '38px', height: '38px', borderRadius: '50%',
    border: `1px solid ${colors.border}`, background: colors.panelAlt,
    color: colors.textMuted, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  const Brand = (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, textDecoration: 'none' }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '14px',
        background: `linear-gradient(140deg, ${colors.accent}, #ff8a3d)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: shadow.glow, flexShrink: 0,
      }}>
        <FaHamburger size={20} color="#fff" />
      </div>
      <div style={{ minWidth: 0, overflow: 'hidden' }}>
        <div style={{ fontFamily: font.display, fontWeight: 700, color: colors.text, fontSize: '15px' }}>foodie</div>
        <div style={{ color: colors.textMuted, fontSize: '11px', textTransform: 'capitalize' }}>
          {user ? user.role : 'Guest'}
        </div>
      </div>
    </Link>
  );

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg, color: colors.textPrimary,
      fontFamily: font.body, display: 'flex',
    }}>
      {/* Desktop sidebar — matches Sidebar.jsx styling */}
      {!isMobile && (
        <aside style={{
          width: '224px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
          padding: '26px 16px', display: 'flex', flexDirection: 'column',
          background: colors.panel, borderRight: `1px solid ${colors.border}`,
          borderRadius: `${radius.lg} 0 0 ${radius.lg}`, backdropFilter: 'blur(18px)',
          fontFamily: font.body,
        }}>
          <div style={{ padding: '0 8px', marginBottom: '34px' }}>{Brand}</div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {NAV.map((item) => <NavItem key={item.to} item={item} />)}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '18px', borderTop: `1px solid ${colors.border}` }}>
            <button style={iconBtn} title="Settings"><Settings size={17} /></button>
            <button style={iconBtn} title="Notifications"><Bell size={17} /></button>
            <button
              onClick={handleLogout}
              title="Log out"
              style={{ ...iconBtn, marginLeft: 'auto', background: colors.accentSoft, color: colors.accent, borderColor: 'transparent' }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </aside>
      )}

      {/* Main column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', gap: spacing(3),
          padding: `${spacing(3)} ${spacing(4)}`,
          background: colors.panel, borderBottom: `1px solid ${colors.border}`,
        }}>
          {isMobile && (
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              style={{
                flexShrink: 0, background: colors.panelAlt, border: 'none',
                borderRadius: radius.sm, padding: spacing(2),
                color: colors.textPrimary, cursor: 'pointer', lineHeight: 0,
              }}
            >
              <MenuIcon size={20} />
            </button>
          )}
          <h1 style={{
            flex: 1, minWidth: 0, margin: 0,
            fontFamily: font.display, fontWeight: 700,
            fontSize: isMobile ? '17px' : '20px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{title}</h1>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </header>

        <main style={{
          flex: 1, width: '100%', maxWidth: 1100, margin: '0 auto',
          padding: isMobile ? spacing(4) : spacing(6),
          paddingBottom: isMobile ? 96 : spacing(8), // clear bottom bar
          boxSizing: 'border-box',
        }}>
          {children}
        </main>
      </div>

      {/* Mobile drawer — matches Sidebar.jsx styling */}
      {isMobile && open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
          />
          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
            width: 'min(80vw, 280px)', background: colors.panel,
            borderRight: `1px solid ${colors.border}`, padding: '26px 16px',
            display: 'flex', flexDirection: 'column', fontFamily: font.body,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: '34px' }}>
              {Brand}
              <button aria-label="Close menu" onClick={() => setOpen(false)} style={{
                background: 'transparent', border: 'none', color: colors.textMuted,
                cursor: 'pointer', lineHeight: 0, flexShrink: 0,
              }}>
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              {NAV.map((item) => <NavItem key={item.to} item={item} onClick={() => setOpen(false)} />)}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '18px', borderTop: `1px solid ${colors.border}` }}>
              <button style={iconBtn} title="Settings"><Settings size={17} /></button>
              <button style={iconBtn} title="Notifications"><Bell size={17} /></button>
              <button
                onClick={handleLogout}
                title="Log out"
                style={{ ...iconBtn, marginLeft: 'auto', background: colors.accentSoft, color: colors.accent, borderColor: 'transparent' }}
              >
                <LogOut size={17} />
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Mobile bottom tab bar */}
      {isMobile && (
        <nav style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 35,
          display: 'grid', gridTemplateColumns: `repeat(${NAV.length}, 1fr)`,
          background: colors.panel, borderTop: `1px solid ${colors.border}`,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {NAV.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: `${spacing(2)} 0`, textDecoration: 'none',
              color: isActive ? colors.accent : colors.textMuted,
              fontSize: '10px', fontFamily: font.body, minWidth: 0,
            })}>
              <Icon size={18} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}