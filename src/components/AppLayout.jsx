import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed, Wallet, Receipt, ShoppingCart, User,
  Menu as MenuIcon, X, LogOut,
} from 'lucide-react';
import { colors, font, radius, spacing } from '../styles/tokens';
import { useAuth } from '../context/AuthContext';

// Customer-facing nav only. Admin/staff use AdminLayout + Sidebar instead.
const NAV = [
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/order', label: 'Order', icon: ShoppingCart },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/profile', label: 'Profile', icon: User },
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

export default function AppLayout({ title, action, children }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!isMobile) setOpen(false); }, [isMobile]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const linkStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: spacing(3),
    padding: `${spacing(3)} ${spacing(4)}`,
    borderRadius: radius.md,
    color: isActive ? colors.textPrimary : colors.textMuted,
    background: isActive ? colors.panelAlt : 'transparent',
    textDecoration: 'none', fontFamily: font.body, fontWeight: 500,
    fontSize: '14px', whiteSpace: 'nowrap',
  });

  const Brand = (
    <div style={{ display: 'flex', alignItems: 'center', gap: spacing(2), minWidth: 0 }}>
      <div style={{
        width: 32, height: 32, flexShrink: 0, display: 'grid', placeItems: 'center',
        borderRadius: radius.sm, background: colors.accent,
      }}>
        <UtensilsCrossed size={18} color="#fff" />
      </div>
      <span style={{
        fontFamily: font.display, fontWeight: 700, fontSize: '16px',
        color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>Canteen</span>
    </div>
  );

  const navLinks = (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} style={linkStyle} onClick={() => setOpen(false)}>
          <Icon size={18} style={{ flexShrink: 0 }} />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg, color: colors.textPrimary,
      fontFamily: font.body, display: 'flex',
    }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside style={{
          width: 240, flexShrink: 0, borderRight: `1px solid ${colors.border}`,
          background: colors.panel, padding: spacing(5),
          display: 'flex', flexDirection: 'column', gap: spacing(6),
          position: 'sticky', top: 0, height: '100vh',
        }}>
          {Brand}
          {navLinks}
          <button onClick={logout} style={{
            marginTop: 'auto', display: 'flex', alignItems: 'center', gap: spacing(2),
            background: 'transparent', border: `1px solid ${colors.border}`,
            color: colors.textMuted, borderRadius: radius.md,
            padding: spacing(3), cursor: 'pointer', fontFamily: font.body,
          }}>
            <LogOut size={16} /> Log out
          </button>
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

      {/* Mobile drawer */}
      {isMobile && open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
          />
          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
            width: 'min(80vw, 280px)', background: colors.panel,
            borderRight: `1px solid ${colors.border}`, padding: spacing(5),
            display: 'flex', flexDirection: 'column', gap: spacing(6),
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {Brand}
              <button aria-label="Close menu" onClick={() => setOpen(false)} style={{
                background: 'transparent', border: 'none', color: colors.textMuted,
                cursor: 'pointer', lineHeight: 0,
              }}>
                <X size={20} />
              </button>
            </div>
            {navLinks}
            <button onClick={() => { setOpen(false); logout(); }} style={{
              marginTop: 'auto', display: 'flex', alignItems: 'center', gap: spacing(2),
              background: 'transparent', border: `1px solid ${colors.border}`,
              color: colors.textMuted, borderRadius: radius.md,
              padding: spacing(3), cursor: 'pointer', fontFamily: font.body,
            }}>
              <LogOut size={16} /> Log out
            </button>
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
          {NAV.map(({ to, label, icon: Icon }) => (
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