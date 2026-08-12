import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu as MenuIcon, X, LogOut, Flame } from 'lucide-react';
import { colors, font, radius, spacing } from '../styles/tokens';
import { useAuth } from '../context/AuthContext';
import Sidebar, { NAV_ITEMS } from './Sidebar';

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

// Wraps Sidebar (desktop-only, admin/staff) with a responsive shell —
// mirrors AppLayout's mobile header + drawer so admin/staff pages behave
// the same on small screens as the customer-facing pages do.
export default function AdminLayout({ title, action, children }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const items = NAV_ITEMS.filter((i) => user && i.roles.includes(user.role));

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
        <Flame size={18} color="#fff" />
      </div>
      <span style={{
        fontFamily: font.display, fontWeight: 700, fontSize: '16px',
        color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>Rustico</span>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg, color: colors.textPrimary,
      fontFamily: font.body, display: 'flex',
    }}>
      {/* Desktop: reuse Sidebar as-is */}
      {!isMobile && <Sidebar />}

      {/* Main column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {isMobile && (
          <header style={{
            position: 'sticky', top: 0, zIndex: 30,
            display: 'flex', alignItems: 'center', gap: spacing(3),
            padding: `${spacing(3)} ${spacing(4)}`,
            background: colors.panel, borderBottom: `1px solid ${colors.border}`,
          }}>
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
            <h1 style={{
              flex: 1, minWidth: 0, margin: 0,
              fontFamily: font.display, fontWeight: 700, fontSize: '17px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{title}</h1>
            {action && <div style={{ flexShrink: 0 }}>{action}</div>}
          </header>
        )}

        <main style={{
          flex: 1, width: '100%', maxWidth: 1100, margin: '0 auto',
          padding: isMobile ? spacing(4) : spacing(6),
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
            <nav style={{ display: 'flex', flexDirection: 'column', gap: spacing(1) }}>
              {items.map(({ to, label, Icon }) => (
                <NavLink key={to} to={to} style={linkStyle} onClick={() => setOpen(false)}>
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {label}
                </NavLink>
              ))}
            </nav>
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
    </div>
  );
}