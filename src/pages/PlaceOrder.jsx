import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orders';
import { colors } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, Button, Select, Input, PageTitle, ErrorText } from '../components/ui';

export default function PlaceOrder() {
  const cartCtx = useCart();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState('dine-in');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(null);

  const lines = [];
  for (let i = 0; i < cartCtx.cart.length; i++) {
    const line = cartCtx.cart[i];
    lines.push(
      <div key={line.menuItem} style={{ padding: '10px 0', borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{line.name}</div>
            <div style={{ color: colors.textMuted, fontSize: '12px' }}>${line.price.toFixed(2)} each</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button variant="ghost" style={{ padding: '4px 12px' }} onClick={() => cartCtx.changeQuantity(line.menuItem, -1)}>-</Button>
            <span>{line.quantity}</span>
            <Button variant="ghost" style={{ padding: '4px 12px' }} onClick={() => cartCtx.changeQuantity(line.menuItem, 1)}>+</Button>
            <div style={{ width: '60px', textAlign: 'right', color: colors.accent, fontWeight: 600 }}>
              ${(line.price * line.quantity).toFixed(2)}
            </div>
          </div>
        </div>
        <Input
          label=""
          placeholder="Add a note (e.g. no onions, extra spicy)"
          value={line.customizations}
          onChange={(e) => cartCtx.setCustomizations(line.menuItem, e.target.value)}
          style={{ marginTop: '8px', padding: '8px 12px', fontSize: '13px' }}
        />
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setError('');
    setBusy(true);
    try {
      const items = [];
      for (let i = 0; i < cartCtx.cart.length; i++) {
        const line = cartCtx.cart[i];
        items.push({ menuItem: line.menuItem, quantity: line.quantity, customizations: line.customizations });
      }
      const order = await createOrder({ items, orderType });
      cartCtx.clearCart();
      setPlaced(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (placed) {
    return (
      <AppLayout>
        <PageTitle>Order placed</PageTitle>
        <Card style={{ maxWidth: '420px' }}>
          <p style={{ color: colors.textMuted, marginBottom: '12px' }}>
            Your order (#{placed._id.slice(-6)}) has been sent to the kitchen. Total: ${Number(placed.totalAmount).toFixed(2)}
          </p>
          <Link to="/menu" style={{ color: colors.accent }}>Back to menu</Link>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTitle>Your order</PageTitle>
      {cartCtx.cart.length === 0 ? (
        <Card style={{ maxWidth: '420px' }}>
          <p style={{ color: colors.textMuted }}>Your cart is empty.</p>
          <Link to="/menu" style={{ color: colors.accent }}>Browse the menu</Link>
        </Card>
      ) : (
        <Card style={{ maxWidth: '480px' }}>
          {lines}
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px' }}>
            <span>Total</span>
            <span>${cartCtx.total().toFixed(2)}</span>
          </div>
          <div style={{ marginTop: '16px' }}>
            <Select label="Order type" value={orderType} onChange={(e) => setOrderType(e.target.value)}>
              <option value="dine-in">Dine in</option>
              <option value="delivery">Delivery</option>
            </Select>
          </div>
          <ErrorText>{error}</ErrorText>
          <Button style={{ marginTop: '16px', width: '100%' }} onClick={handlePlaceOrder} disabled={busy}>
            {busy ? 'Placing order...' : 'Place order'}
          </Button>
        </Card>
      )}
    </AppLayout>
  );
}