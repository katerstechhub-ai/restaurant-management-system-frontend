import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, CheckCircle2, Bike, UtensilsCrossed, Wallet as WalletIcon, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, payOrderWithCard } from '../api/orders';
import { getWallet } from '../api/wallet';
import { colors, radius, font } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, Button, Input, PageTitle, ErrorText, Thumb, EmptyState } from '../components/ui';

// One pill in the payment-method row. 'active' mirrors the look of the
// dine-in/delivery toggle above it so the two choices read as the same
// kind of control.
function PaymentOption({ active, onClick, Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '11px',
        borderRadius: radius.pill,
        border: '1px solid transparent',
        background: active ? colors.accent : colors.panelAlt,
        color: active ? '#fff' : colors.textMuted,
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {Icon && <Icon size={16} />} {label}
    </button>
  );
}

export default function PlaceOrder() {
  const cartCtx = useCart();
  const { user, updateAddress } = useAuth();
  const [orderType, setOrderType] = useState('dine-in');
  // 'table' (pay later, dine-in only) | 'wallet' | 'card'
  const [paymentMethod, setPaymentMethod] = useState('table');
  const [balance, setBalance] = useState(null);
  const [addressInput, setAddressInput] = useState('');
  const [error, setError] = useState('');
  const [shortfall, setShortfall] = useState(null);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(null);

  useEffect(() => {
    getWallet().then((res) => setBalance(res.balance)).catch(() => {});
  }, []);

  // Prefill from the profile once it loads, without clobbering anything
  // the person has already typed this session.
  useEffect(() => {
    if (user?.address && !addressInput) setAddressInput(user.address);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // "Pay at table" only makes sense for dine-in — bump to wallet the
  // moment someone switches to delivery so the button never offers an
  // invalid combination.
  useEffect(() => {
    if (orderType === 'delivery' && paymentMethod === 'table') {
      setPaymentMethod('wallet');
    }
  }, [orderType]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = cartCtx.total();
  const isDelivery = orderType === 'delivery';
  const hasAddress = Boolean((user?.address || addressInput).trim());
  const needsAddress = isDelivery && !hasAddress;

  const resetFeedback = () => {
    setError('');
    setShortfall(null);
  };

  const handleWalletOrTablePay = async () => {
    resetFeedback();
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
        payWithWallet: paymentMethod === 'wallet',
        deliveryAddress: isDelivery ? addressInput.trim() : undefined,
      });
      if (isDelivery && addressInput.trim() && !user?.address) {
        updateAddress(addressInput.trim()).catch(() => {});
      }
      cartCtx.clearCart();
      setPlaced(order);
    } catch (err) {
      if (err.response?.status === 402) {
        const data = err.response.data;
        setError('Not enough wallet balance to cover this order.');
        setShortfall(data.shortfall);
        setBalance(data.balance);
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCardPay = () => {
    resetFeedback();

    if (!window.PaystackPop) {
      setError('Payment library not loaded. Refresh and try again.');
      return;
    }

    const items = cartCtx.cart.map((line) => ({
      menuItem: line.menuItem,
      quantity: line.quantity,
      customizations: line.customizations,
    }));
    const deliveryAddress = isDelivery ? addressInput.trim() : undefined;

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: Math.round(total * 100), // kobo
      metadata: { userId: user._id },
      callback: (response) => {
        setBusy(true);
        payOrderWithCard({ reference: response.reference, items, orderType, deliveryAddress })
          .then((order) => {
            if (isDelivery && deliveryAddress && !user?.address) {
              updateAddress(deliveryAddress).catch(() => {});
            }
            cartCtx.clearCart();
            setPlaced(order);
          })
          .catch((err) => setError(err.response?.data?.message || err.message))
          .finally(() => setBusy(false));
      },
      onClose: () => {},
    });

    handler.openIframe();
  };

  const handleSubmit = () => {
    if (needsAddress) {
      setError('Add a delivery address to continue.');
      return;
    }
    if (paymentMethod === 'card') {
      handleCardPay();
    } else {
      handleWalletOrTablePay();
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
            {placed.paidWithCard ? ' · Paid by card' : ''}
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
                <button
                  type="button"
                  aria-label={`Remove ${line.name} from cart`}
                  onClick={() => cartCtx.changeQuantity(line.menuItem, -line.quantity)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    color: colors.textMuted,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Trash2 size={15} />
                </button>
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

        {/* Payment method */}
        <div style={{
          marginTop: '18px',
          padding: '14px',
          borderRadius: radius.sm,
          background: colors.panelAlt,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {!isDelivery && (
              <PaymentOption active={paymentMethod === 'table'} onClick={() => setPaymentMethod('table')} label="Pay at table" />
            )}
            <PaymentOption
              active={paymentMethod === 'wallet'}
              onClick={() => setPaymentMethod('wallet')}
              Icon={WalletIcon}
              label={`Wallet · ${balance === null ? '—' : `₦${Number(balance).toFixed(2)}`}`}
            />
            <PaymentOption active={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')} Icon={CreditCard} label="Pay with card" />
          </div>

          {isDelivery && (
            <div style={{ fontSize: '12px', color: colors.textMuted }}>
              Delivery orders are paid upfront, by wallet or card.
            </div>
          )}

          {needsAddress && (
            <Input
              label="Delivery address"
              placeholder="Street, city, landmark"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
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
            You need ₦{Number(shortfall).toFixed(2)} more in your wallet, or{' '}
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              style={{ background: 'none', border: 'none', padding: 0, color: colors.accent, fontWeight: 700, cursor: 'pointer' }}
            >
              pay with card instead →
            </button>
          </div>
        )}

        <Button
          style={{ marginTop: '16px', width: '100%', padding: '14px' }}
          onClick={handleSubmit}
          disabled={busy}
        >
          {busy
            ? 'Placing order…'
            : paymentMethod === 'card'
            ? 'Pay with card'
            : paymentMethod === 'wallet'
            ? 'Pay & confirm order'
            : 'Confirm order'}
        </Button>
      </Card>
    </AppLayout>
  );
}