import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  ShoppingCart,
  UtensilsCrossed,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { getMenuItems } from '../api/menu';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { colors, radius, font } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import AdminLayout from '../components/AdminLayout';
import { Card, Button, PageTitle, ErrorText, EmptyState } from '../components/ui';

// Fixed, non-data-driven photo for the "All" chip only — a general food
// spread, not tied to any single dish. Every named category below this
// always uses a real admin-uploaded photo instead.
const ALL_CATEGORY_THUMB =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop';

// A small "price tag" shape — a nod to market-stall price tags rather than a
// flat price row. Ties the ticket/stamp motif together with the divider below.
function PriceTag({ children, big }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: big ? '8px 16px 8px 20px' : '6px 13px 6px 16px',
        background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentSecondary})`,
        color: '#fff',
        fontFamily: font.display,
        fontWeight: 800,
        fontSize: big ? '16px' : '13.5px',
        clipPath: 'polygon(11px 0, 100% 0, 100% 100%, 11px 100%, 0 50%)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: '5px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.85)',
        }}
      />
      {children}
    </span>
  );
}

// The ticket-tear divider: a dashed rule with two small punched-hole dots at
// each end, like a torn kitchen order ticket.
function TicketDivider() {
  return (
    <div style={{ position: 'relative', margin: '2px 0 4px' }}>
      <div style={{ borderTop: `2px dashed ${colors.border}` }} />
      <span style={{
        position: 'absolute', left: '-2px', top: '-5px',
        width: '10px', height: '10px', borderRadius: '50%', background: colors.panel,
        border: `2px solid ${colors.border}`,
      }} />
      <span style={{
        position: 'absolute', right: '-2px', top: '-5px',
        width: '10px', height: '10px', borderRadius: '50%', background: colors.panel,
        border: `2px solid ${colors.border}`,
      }} />
    </div>
  );
}

export default function Menu() {
  const { user } = useAuth();
  const cartCtx = useCart();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenuItems()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))],
    [items]
  );

  // Real dish photos per category — pulled from whatever admin has actually
  // uploaded, not stock photos. Categories with no photographed item yet
  // fall back to an icon medallion. "All" always uses the fixed thumb above.
  const categoryImages = useMemo(() => {
    const map = {};
    items.forEach((i) => {
      if (i.category && i.image && !map[i.category]) {
        map[i.category] = i.image;
      }
    });
    return map;
  }, [items]);

  const visible = useMemo(() => {
    return items.filter((i) => {
      const matchesQuery =
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        (i.description || '').toLowerCase().includes(query.toLowerCase());
      const matchesCat = category === 'All' || i.category === category;
      return matchesQuery && matchesCat;
    });
  }, [items, query, category]);

  const isCustomer = user && user.role === 'customer';
  const isStaffOrAdmin = user && (user.role === 'admin' || user.role === 'staff');
  const Layout = isStaffOrAdmin ? AdminLayout : AppLayout;

  return (
    <Layout title="Menu">
      <PageTitle
        subtitle={`${items.length} dishes available today`}
        action={
          isCustomer && cartCtx.cart.length > 0 ? (
            <Button onClick={() => navigate('/order')}>
              <ShoppingCart size={16} /> View cart ({cartCtx.cart.length})
            </Button>
          ) : null
        }
      >
        Menu
      </PageTitle>

      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: `linear-gradient(145deg, ${colors.panel}, ${colors.panelAlt})`,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.pill,
          padding: '12px 20px',
          marginBottom: '24px',
          maxWidth: '560px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}
      >
        <Search size={18} color={colors.textMuted} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search food, cuisine or a dish..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: colors.textPrimary,
            fontSize: '14px',
            fontFamily: font.body,
          }}
        />
      </div>

      {/* Categories — real menu photos, squared "label" medallions instead of
          generic circular avatars, dashed ring when inactive to match the
          ticket motif used on the cards below. "All" uses a fixed photo. */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
            color: colors.textPrimary,
            fontFamily: font.display,
            fontWeight: 600,
            fontSize: '15px',
          }}
        >
          <Sparkles size={16} color={colors.accent} /> Browse by category
        </div>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {categories.map((c) => {
            const active = c === category;
            const thumb = c === 'All' ? ALL_CATEGORY_THUMB : categoryImages[c];
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: `2px ${active ? 'solid' : 'dashed'} ${active ? 'transparent' : colors.border}`,
                  background: active
                    ? `linear-gradient(135deg, ${colors.accent}, ${colors.accentSecondary})`
                    : colors.panel,
                  color: active ? '#fff' : colors.textMuted,
                  borderRadius: radius.pill,
                  padding: '6px 16px 6px 6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: active ? '0 6px 18px rgba(225,72,60,0.28)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: radius.sm,
                    overflow: 'hidden',
                    border: `2px solid ${active ? 'rgba(255,255,255,0.35)' : colors.border}`,
                    flexShrink: 0,
                    background: colors.panelAlt,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={c}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <UtensilsCrossed size={14} color={active ? '#fff' : colors.textMuted} />
                  )}
                </span>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <div style={{ color: colors.textMuted, padding: '40px 0' }}>Loading menu…</div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No dishes found"
          hint="Try a different search or category."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          {visible.map((item) => (
            <Card
              key={item._id}
              hover
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: colors.panel,
                border: `1px solid ${colors.border}`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: '180px',
                  background: colors.panelAlt,
                }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.textMuted,
                    }}
                  >
                    <UtensilsCrossed size={36} />
                  </div>
                )}

                {!item.available && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.65)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      color: colors.textPrimary,
                      fontWeight: 600,
                      backdropFilter: 'blur(3px)',
                    }}
                  >
                    Currently unavailable
                  </div>
                )}

                {item.category && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(20,20,20,0.78)',
                      color: colors.textPrimary,
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '5px 11px',
                      borderRadius: radius.pill,
                      border: `1px dashed rgba(255,255,255,0.4)`,
                      transform: 'rotate(-3deg)',
                      letterSpacing: '.03em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.category}
                  </span>
                )}
              </div>

              <div
                style={{
                  padding: '16px 18px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontFamily: font.display,
                    fontWeight: 700,
                    fontSize: '16px',
                    color: colors.textPrimary,
                  }}
                >
                  {item.name}
                </div>

                {item.description && (
                  <div
                    style={{
                      color: colors.textMuted,
                      fontSize: '13px',
                      lineHeight: 1.55,
                      marginTop: '6px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.description}
                  </div>
                )}

                {item.prepTimeMinutes ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: colors.textMuted,
                      fontSize: '12px',
                      marginTop: '8px',
                    }}
                  >
                    <Clock size={13} /> {item.prepTimeMinutes} min
                  </div>
                ) : null}

                <TicketDivider />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <PriceTag big>₦{Number(item.price).toFixed(2)}</PriceTag>

                  {isCustomer && item.available ? (
                    <Button
                      style={{
                        padding: '8px 16px',
                        borderRadius: radius.md,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      onClick={() => cartCtx.addItem(item)}
                    >
                      <Plus size={15} /> Add
                    </Button>
                  ) : isCustomer ? (
                    <span style={{ color: colors.textMuted, fontSize: '12px', fontWeight: 500 }}>
                      Unavailable
                    </span>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Floating cart pill for mobile */}
      {isCustomer && cartCtx.cart.length > 0 && (
        <button
          onClick={() => navigate('/order')}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentSecondary})`,
            color: '#fff',
            border: 'none',
            borderRadius: radius.pill,
            padding: '14px 22px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(225,72,60,0.35)',
          }}
        >
          <ShoppingCart size={18} />
          {cartCtx.cart.length} item
          {cartCtx.cart.length === 1 ? '' : 's'}
          <ChevronRight size={16} />
        </button>
      )}
    </Layout>
  );
}