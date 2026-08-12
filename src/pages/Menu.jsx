import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Plus, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { getMenuItems } from '../api/menu';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { colors, radius, font } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import AdminLayout from '../components/AdminLayout';
import { Card, Button, PageTitle, ErrorText, EmptyState } from '../components/ui';

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

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))];

  const visible = items.filter((i) => {
    const matchesQuery = i.name.toLowerCase().includes(query.toLowerCase());
    const matchesCat = category === 'All' || i.category === category;
    return matchesQuery && matchesCat;
  });

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

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.pill,
          padding: '10px 18px',
          marginBottom: '20px',
          maxWidth: '520px',
        }}
      >
        <Search size={17} color={colors.textMuted} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search food, cuisine or a dish"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: colors.text,
            fontSize: '13px',
            fontFamily: font.body,
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              border: `1px solid ${c === category ? 'transparent' : colors.border}`,
              background: c === category ? colors.accent : 'transparent',
              color: c === category ? '#fff' : colors.textMuted,
              borderRadius: radius.pill,
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <div style={{ color: colors.textMuted }}>Loading menu…</div>
      ) : visible.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="No dishes found" hint="Try a different search or category." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '20px' }}>
          {visible.map((item) => (
            <Card key={item._id} hover style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '150px', background: colors.panelAlt }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
                    <UtensilsCrossed size={26} />
                  </div>
                )}
                {!item.available && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: colors.textMuted,
                      fontStyle: 'italic',
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
                      background: 'rgba(20,20,20,0.75)',
                      color: colors.text,
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: radius.pill,
                      backdropFilter: 'blur(6px)',
                    }}
                  >
                    {item.category}
                  </span>
                )}
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: '15px' }}>{item.name}</div>
                {item.description && (
                  <div style={{ color: colors.textMuted, fontSize: '12.5px', lineHeight: 1.5 }}>{item.description}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.warning, fontSize: '12px' }}>
                  <Star size={13} fill={colors.warning} strokeWidth={0} />
                  {item.rating ? Number(item.rating).toFixed(1) : '4.5'}
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                  <div style={{ color: colors.accent, fontWeight: 700, fontSize: '16px' }}>
                    ${Number(item.price).toFixed(2)}
                  </div>
                  {isCustomer && item.available && (
                    <Button style={{ padding: '8px 14px' }} onClick={() => cartCtx.addItem(item)}>
                      <Plus size={15} /> Add
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}