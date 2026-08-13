import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, CheckCircle2, Bike, UtensilsCrossed, Wallet as WalletIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orders';
import { getWallet } from '../api/wallet';
import { colors, radius, font } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, Button, Input, PageTitle, ErrorText, Thumb, EmptyState } from '../components/ui';

export default function PlaceOrder() {
  const cartCtx = useCart();
  const [orderType, setOrderType] = useState('dine-in');
  const [payWithWallet, setPayWithWallet] = useState(false);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');
  const [shortfall, setShortfall] = useState(null);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(null);

  useEffect(() => {
    getWallet().then((res) => setBalance(res.balance)).catch(() => {});
  }, []);

  const total = cartCtx.total();
  const isDelivery = orderType === 'delivery';
  const willPayWithWallet = isDelivery || payWithWallet;
  const hasEnoughBalance = balance !== null && balance >= total;

  const handlePlaceOrder = async () => {
    setError('');
    setShortfall(null);
    setBusy(true);
    try {
      const items = cartCtx.cart.map((line) => ({
        menuItem: line.menuItem,
        quantity: line.quantity,
        customizations: line.customizations,
      }));
      const order = await createOrder({
        items,
        orderType,
        payWithWallet: willPayWithWallet,
      });
      cartCtx.clearCart();
      setPlaced(order);
    } catch (err) {
      // createOrder rejects with err.message from the axios interceptor;
      // if the backend sent structured 402 data, err.response still has it.
      if (err.response && err.response.status === 402) {
        const data = err.response.data;
        setError('Not enough wallet balance to cover this order.');
        setShortfall(data.shortfall);
        setBalance(data.balance);
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  if (placed) {
    return (
      <AppLayout>
        <PageTitle>Order placed</PageTitle>
        <Card style={{ maxWidth: '440px', textAlign: 'center', padding: '36px 24px' }}>
          <CheckCircle2 size={44} color={colors.success} strokeWidth={1.6} />
          <h2 style={{ fontFamily: font.display, fontSize: '18px', margin: '14px 0 8px' }}>
            Sent to the kitchen
          </h2>
          <p style={{ color: colors.textMuted, fontSize: '13px', margin: 0 }}>
            Order #{placed._id.slice(-6)} · Total ₦{Number(placed.totalAmount).toFixed(2)}
            {placed.paidWithWallet ? ' · Paid from wallet' : ''}
          </p>
          <Link to="/menu" style={{ display: 'inline-block', marginTop: '20px', color: colors.accent, fontWeight: 600, textDecoration: 'none' }}>
            Back to menu →
          </Link>
        </Card>
      </AppLayout>
    );
  }

  if (cartCtx.cart.length === 0) {
    return (
      <AppLayout>
        <PageTitle>Your order</PageTitle>
        <div style={{ maxWidth: '440px' }}>
          <EmptyState icon={ShoppingCart} title="Your cart is empty" hint="Add something delicious from the menu." />
          <Link to="/menu" style={{ display: 'inline-block', marginTop: '14px', color: colors.accent, fontWeight: 600, textDecoration: 'none' }}>
            Browse the menu →
          </Link>
        </div>
      </AppLayout>
    );
  }

  const typeOptions = [
    { value: 'dine-in', label: 'Dine in', Icon: UtensilsCrossed },
    { value: 'delivery', label: 'Delivery', Icon: Bike },
  ];

  return (
    <AppLayout>
      <PageTitle subtitle={`${cartCtx.cart.length} item(s) in cart`}>Your order</PageTitle>

      <Card style={{ maxWidth: '540px', padding: '22px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          {typeOptions.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => setOrderType(value)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: radius.pill,
                border: '1px solid transparent',
                background: orderType === value ? colors.accent : colors.panelAlt,
                color: orderType === value ? '#fff' : colors.textMuted,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {cartCtx.cart.map((line) => (
          <div key={line.menuItem} style={{ padding: '14px 0', borderBottom: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Thumb src={line.imageUrl} alt={line.name} size={50} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{line.name}</div>
                <div style={{ color: colors.textMuted, fontSize: '12px' }}>₦{line.price.toFixed(2)} each</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button variant="soft" style={{ padding: '6px' }} onClick={() => cartCtx.changeQuantity(line.menuItem, -1)}>
                  <Minus size={14} />
                </Button>
                <span style={{ minWidth: '18px', textAlign: 'center', fontWeight: 600 }}>{line.quantity}</span>
                <Button variant="soft" style={{ padding: '6px' }} onClick={() => cartCtx.changeQuantity(line.menuItem, 1)}>
                  <Plus size={14} />
                </Button>
                <div style={{ width: '66px', textAlign: 'right', color: colors.accent, fontWeight: 700 }}>
                  ₦{(line.price * line.quantity).toFixed(2)}
                </div>
              </div>
            </div>
            <Input
              placeholder="Add a note (e.g. no onions, extra spicy)"
              value={line.customizations}
              onChange={(e) => cartCtx.setCustomizations(line.menuItem, e.target.value)}
              style={{ marginTop: '10px', padding: '9px 13px', fontSize: '12.5px' }}
            />
          </div>
        ))}

        {/* Wallet payment section */}
        <div style={{
          marginTop: '18px',
          padding: '14px',
          borderRadius: radius.sm,
          background: colors.panelAlt,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMuted, fontSize: '13px' }}>
              <WalletIcon size={15} />
              Wallet balance
            </div>
            <span style={{ fontWeight: 700 }}>
              {balance === null ? '—' : `₦${Number(balance).toFixed(2)}`}
            </span>
          </div>

          {isDelivery ? (
            <div style={{ fontSize: '12px', color: colors.textMuted }}>
              Delivery orders are paid from your wallet automatically.
            </div>
          ) : (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={payWithWallet}
                onChange={(e) => setPayWithWallet(e.target.checked)}
              />
              Pay from wallet now instead of at the table
            </label>
          )}
        </div>

        <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: colors.textMuted, fontSize: '13px' }}>Total</span>
          <span style={{ fontFamily: font.display, fontSize: '22px', fontWeight: 700 }}>
            ₦{total.toFixed(2)}
          </span>
        </div>

        <ErrorText>{error}</ErrorText>

        {shortfall !== null && (
          <div style={{
            marginTop: '10px',
            padding: '12px',
            borderRadius: radius.sm,
            background: `${colors.accent}15`,
            fontSize: '13px',
          }}>
            You need ₦{Number(shortfall).toFixed(2)} more in your wallet.{' '}
            <Link to="/wallet" style={{ color: colors.accent, fontWeight: 700, textDecoration: 'none' }}>
              Top up now →
            </Link>
          </div>
        )}

        <Button
          style={{ marginTop: '16px', width: '100%', padding: '14px' }}
          onClick={handlePlaceOrder}
          disabled={busy}
        >
          {busy ? 'Placing order…' : willPayWithWallet ? 'Pay & confirm order' : 'Confirm order'}
        </Button>
      </Card>
    </AppLayout>
  );
}