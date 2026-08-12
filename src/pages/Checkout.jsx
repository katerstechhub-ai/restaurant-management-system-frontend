import { useEffect, useState } from 'react';
import { Banknote, CreditCard, Smartphone, RotateCcw, CheckCircle2 } from 'lucide-react';
import { getOrders } from '../api/orders';
import { generateBill, processPayment } from '../api/billing';
import { colors, statusColor, radius, font } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, Button, Select, Input, StatusPill, PageTitle, ErrorText } from '../components/ui';

const METHODS = [
  { value: 'cash', label: 'Cash', Icon: Banknote },
  { value: 'card', label: 'Card', Icon: CreditCard },
  { value: 'mobile', label: 'Mobile', Icon: Smartphone },
];

function Row({ label, value, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '9px', fontSize: '13.5px' }}>
      <span style={{ color: colors.textMuted }}>{label}</span>
      <span style={{ color: muted ? colors.textMuted : colors.text }}>{value}</span>
    </div>
  );
}

export default function Checkout() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [method, setMethod] = useState('cash');
  const [discount, setDiscount] = useState('0');
  const [extraCharges, setExtraCharges] = useState('0');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getOrders().then(setOrders).catch((err) => setError(err.message));
  }, []);

  const handleGenerateBill = async () => {
    setError('');
    setBusy(true);
    try {
      const bill = await generateBill(selectedOrderId, {
        discount: Number(discount) || 0,
        extraCharges: Number(extraCharges) || 0,
        method,
      });
      setPayment(bill);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handlePay = async () => {
    setError('');
    setBusy(true);
    try {
      setPayment(await processPayment(payment._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <PageTitle subtitle="Generate a bill and take payment">Checkout</PageTitle>

      <Card style={{ maxWidth: '460px', padding: '24px' }}>
        {!payment ? (
          <>
            <Select label="Order" value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}>
              <option value="">Select an order…</option>
              {orders.map((order) => (
                <option key={order._id} value={order._id}>
                  #{order._id.slice(-6)} · ${Number(order.totalAmount).toFixed(2)} · {order.status}
                </option>
              ))}
            </Select>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <Input label="Discount" type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              <Input label="Extra charges" type="number" min="0" value={extraCharges} onChange={(e) => setExtraCharges(e.target.value)} />
            </div>

            <div style={{ marginTop: '18px' }}>
              <span style={{ display: 'block', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>
                Payment method
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {METHODS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    onClick={() => setMethod(value)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '13px 8px',
                      borderRadius: radius.sm,
                      border: `1px solid ${method === value ? 'transparent' : colors.border}`,
                      background: method === value ? colors.accent : colors.panelAlt,
                      color: method === value ? '#fff' : colors.textMuted,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon size={17} /> {label}
                  </button>
                ))}
              </div>
            </div>

            <ErrorText>{error}</ErrorText>

            <Button style={{ marginTop: '20px', width: '100%', padding: '13px' }} disabled={!selectedOrderId || busy} onClick={handleGenerateBill}>
              {busy ? 'Generating…' : 'Generate bill'}
            </Button>
          </>
        ) : (
          <>
            <Row label="Subtotal" value={`$${Number(payment.subtotal).toFixed(2)}`} />
            <Row label="Discount" value={`-$${Number(payment.discount).toFixed(2)}`} />
            <Row label="Extra charges" value={`+$${Number(payment.extraCharges).toFixed(2)}`} />

            <div
              style={{
                borderTop: `1px dashed ${colors.border}`,
                marginTop: '14px',
                paddingTop: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: '15px' }}>TOTAL</span>
              <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: '24px' }}>
                ${Number(payment.totalAmount).toFixed(2)}
              </span>
            </div>

            <div style={{ margin: '16px 0' }}>
              <StatusPill status={payment.status} color={statusColor(payment.status)} />
            </div>

            <ErrorText>{error}</ErrorText>

            {payment.status !== 'paid' ? (
              <Button style={{ width: '100%', padding: '13px' }} onClick={handlePay} disabled={busy}>
                {busy ? 'Processing…' : `Pay via ${method}`}
              </Button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.success, fontSize: '13px' }}>
                <CheckCircle2 size={16} /> Paid · Ref {payment.transactionRef}
              </div>
            )}

            <Button
              variant="ghost"
              style={{ width: '100%', marginTop: '12px' }}
              onClick={() => { setPayment(null); setSelectedOrderId(''); }}
            >
              <RotateCcw size={15} /> New checkout
            </Button>
          </>
        )}
      </Card>
    </AppLayout>
  );
}
