import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Minus, Plus, Trash2, ShoppingCart, CheckCircle2, Bike, UtensilsCrossed,
  Wallet as WalletIcon, CreditCard, Landmark, Copy,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, verifyOrderPayment } from '../api/orders';
import { getWallet } from '../api/wallet';
import { colors, radius, font } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, Button, Input, PageTitle, ErrorText, Thumb, EmptyState } from '../components/ui';

const PAYMENT_METHODS = [
  { value: 'wallet', label: 'Wallet', Icon: WalletIcon },
  { value: 'paystack', label: 'Card', Icon: CreditCard },
  { value: 'bank_transfer', label: 'Bank Transfer', Icon: Landmark },
];

export default function PlaceOrder() {
  const cartCtx = useCart();
  const { user } = useAuth();
  const [orderType, setOrderType] = useState('dine-in');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState('');
  const [shortfall, setShortfall] = useState(null);
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(null);

  useEffect(() => {
    getWallet().then((res) => setBalance(res.balance)).catch(() => {});
  }, []);

  const total = cartCtx.total();

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

      const order = await createOrder({ items, orderType, paymentMethod });

      if (paymentMethod === 'paystack') {
        cartCtx.clearCart();
        payWithPaystack(order);
        return;
      }

      cartCtx.clearCart();
      setPlaced(order);
    } catch (err) {
      if (err.response && err.response.status === 402) {
        const data = err.response.data;
        setError('Not enough wallet balance to cover this order.');
        setShortfall(data.shortfall);
        setBalance(data.balance);
      } else {
        setError(err.message);
      }
      setBusy(false);
    }
  };

  // Opens Paystack's inline popup — the customer types their card number,
  // expiry and CVV directly in this modal (Paystack handles it securely,
  // there's no redirect away from the site). On success we verify the
  // reference server-side, which is the only thing that actually marks
  // the order as paid.
  const payWithPaystack = (order) => {
    if (!window.PaystackPop) {
      setError('Payment library not loaded. Refresh and try again.');
      setBusy(false);
      setPlaced(order);
      return;
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: Math.round(Number(order.totalAmount) * 100), // kobo
      metadata: { orderId: order._id },
      callback: (response) => {
        verifyOrderPayment(order._id, response.reference)
          .then((verified) => setPlaced(verified))
          .catch((err) => setError(err.message))
          .finally(() => setBusy(false));
      },
      onClose: () => {
        // Popup dismissed without paying — order still exists as
        // pending-payment, just show it so they're not stuck on a blank cart.
        setBusy(false);
        setPlaced(order);
      },
    });

    handler.openIframe();
  };

  if (placed) {
    const isPendingBankTransfer = placed.paymentMethod === 'bank_transfer' && placed.paymentStatus === 'pending';
    const isPendingPaystack = placed.paymentMethod === 'paystack' && placed.paymentStatus === 'pending';

    return (
      <AppLayout>
        <PageTitle>Order placed</PageTitle>
        <Card style={{ maxWidth: '460px', textAlign: 'center', padding: '36px 24px' }}>
          <CheckCircle2 size={44} color={isPendingBankTransfer || isPendingPaystack ? colors.textMuted : colors.success} strokeWidth={1.6} />
          <h2 style={{ fontFamily: font.display, fontSize: '18px', margin: '14px 0 8px' }}>
            {isPendingBankTransfer ? 'Awaiting your transfer' : isPendingPaystack ? 'Payment not completed' : 'Sent to the kitchen'}
          </h2>
          <p style={{ color: colors.textMuted, fontSize: '13px', margin: 0 }}>
            Order #{placed._id.slice(-6)} · Total ₦{Number(placed.totalAmount).toFixed(2)}
          </p>

          {isPendingBankTransfer && placed.bankDetails && (
            <div style={{
              marginTop: '18px', padding: '16px', borderRadius: radius.sm,
              background: colors.panelAlt, textAlign: 'left', fontSize: '13px',
            }}>
              <div style={{ color: colors.textMuted, marginBottom: '8px' }}>
                Transfer the exact order total to:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: colors.textMuted }}>Bank</span>
                <strong>{placed.bankDetails.bankName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: colors.textMuted }}>Account number</span>
                <strong>{placed.bankDetails.accountNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: colors.textMuted }}>Account name</span>
                <strong>{placed.bankDetails.accountName}</strong>
              </div>
              <div style={{ marginTop: '10px', color: colors.textMuted, fontSize: '12px' }}>
                Your order will be confirmed once we receive the transfer.
              </div>
            </div>
          )}

          {isPendingPaystack && (
            <div style={{ marginTop: '14px', color: colors.textMuted, fontSize: '12px' }}>
              You can find and retry this order from your order history.
            </div>
          )}

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

  const hasEnoughBalance = balance !== null && balance >= total;

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
                <Button
                  variant="soft"
                  title="Remove item"
                  style={{ padding: '6px', color: colors.accent }}
                  onClick={() => cartCtx.changeQuantity(line.menuItem, -line.quantity)}
                >
                  <Trash2 size={14} />
                </Button>
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
        <div style={{ marginTop: '18px' }}>
          <div style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '10px' }}>Pay with</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {PAYMENT_METHODS.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setPaymentMethod(value)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  borderRadius: radius.sm,
                  border: `1px solid ${paymentMethod === value ? colors.accent : colors.border}`,
                  background: paymentMethod === value ? `${colors.accent}15` : colors.panelAlt,
                  color: paymentMethod === value ? colors.accent : colors.textMuted,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>

          {paymentMethod === 'wallet' && (
            <div style={{
              marginTop: '12px', padding: '12px 14px', borderRadius: radius.sm,
              background: colors.panelAlt, display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', fontSize: '13px',
            }}>
              <span style={{ color: colors.textMuted }}>Wallet balance</span>
              <span style={{ fontWeight: 700, color: hasEnoughBalance ? colors.text : colors.accent }}>
                {balance === null ? '—' : `₦${Number(balance).toFixed(2)}`}
              </span>
            </div>
          )}

          {paymentMethod === 'bank_transfer' && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: colors.textMuted }}>
              Bank details are shown after you confirm — your order will be marked pending until we receive the transfer.
            </div>
          )}

          {paymentMethod === 'paystack' && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: colors.textMuted }}>
              You'll enter your card details in a secure popup on this page.
            </div>
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
          {busy ? 'Placing order…' : paymentMethod === 'wallet' ? 'Pay & confirm order' : 'Confirm order'}
        </Button>
      </Card>
    </AppLayout>
  );
}