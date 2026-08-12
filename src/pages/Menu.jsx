import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenuItems } from '../api/menu';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { colors, radius } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, Button, PageTitle, ErrorText } from '../components/ui';

export default function Menu() {
  const { user } = useAuth();
  const cartCtx = useCart();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenuItems()
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    cards.push(
      <Card key={item._id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.name}</div>
            {item.category && <div style={{ color: colors.textMuted, fontSize: '12px' }}>{item.category}</div>}
          </div>
          <div style={{ color: colors.accent, fontWeight: 700 }}>${Number(item.price).toFixed(2)}</div>
        </div>
        {item.description && (
          <div style={{ color: colors.textMuted, fontSize: '13px' }}>{item.description}</div>
        )}
        {!item.available && (
          <div style={{ color: colors.textMuted, fontSize: '12px', fontStyle: 'italic' }}>Currently unavailable</div>
        )}
        {user && user.role === 'customer' && item.available && (
          <Button
            variant="ghost"
            style={{ alignSelf: 'flex-start', marginTop: '4px' }}
            onClick={() => cartCtx.addItem(item)}
          >
            Add to cart
          </Button>
        )}
      </Card>
    );
  }

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <PageTitle>Menu</PageTitle>
        {user && user.role === 'customer' && cartCtx.cart.length > 0 && (
          <Button onClick={() => navigate('/order')} style={{ marginBottom: '24px' }}>
            View cart ({cartCtx.cart.length})
          </Button>
        )}
      </div>
      <ErrorText>{error}</ErrorText>
      {loading ? (
        <div style={{ color: colors.textMuted }}>Loading menu...</div>
      ) : items.length === 0 ? (
        <div style={{ color: colors.textMuted }}>No menu items yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', borderRadius: radius.md }}>
          {cards}
        </div>
      )}
    </AppLayout>
  );
}