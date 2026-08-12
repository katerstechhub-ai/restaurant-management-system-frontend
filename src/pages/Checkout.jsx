import { useEffect, useState } from 'react';
import { getOrders } from '../api/orders';
import { generateBill, processPayment } from '../api/billing';
import { colors, statusColor } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, Button, Select, Input, StatusPill, PageTitle, ErrorText } from '../components/ui';

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
    getOrders()
      .then((data) => setOrders(data))
      .catch((err) => setError(err.message));
  }, []);

  const options = [];
  options.push(<option key="" value="">Select an order...</option>);
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    options.push(
      <option key={order._id} value={order._id}>
        #{order._id.slice(-6)} · ${Number(order.totalAmount).toFixed(2)} · {order.status}
      </option>
    );
  }

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
      const updated = await processPayment(payment._id);
      setPayment(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <PageTitle>Checkout</PageTitle>
      <Card style={{ maxWidth: '440px' }}>
        {!payment ? (
          <>
            <Select label="Order" value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}>
              {options}
            </Select>
            <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
              <Input label="Discount" type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              <Input label="Extra charges" type="number" min="0" value={extraCharges} onChange={(e) => setExtraCharges(e.target.value)} />
            </div>
            <div style={{ marginTop: '14px' }}>
              <Select label="Payment method" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile</option>
              </Select>
            </div>
            <ErrorText>{error}</ErrorText>
            <Button style={{ marginTop: '16px', width: '100%' }} disabled={!selectedOrderId || busy} onClick={handleGenerateBill}>
              {busy ? 'Generating...' : 'Generate bill'}
            </Button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: colors.textMuted }}>Subtotal</span>
              <span>${Number(payment.subtotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: colors.textMuted }}>Discount</span>
              <span>-${Number(payment.discount).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: colors.textMuted }}>Extra charges</span>
              <span>+${Number(payment.extraCharges).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px', margin: '10px 0' }}>
              <span>Total</span>
              <span>${Number(payment.totalAmount).toFixed(2)}</span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <StatusPill status={payment.status} color={statusColor(payment.status)} />
            </div>
            <ErrorText>{error}</ErrorText>
            {payment.status !== 'paid' ? (
              <Button style={{ width: '100%' }} onClick={handlePay} disabled={busy}>
                {busy ? 'Processing...' : `Pay via ${method}`}
              </Button>
            ) : (
              <div style={{ color: colors.success, fontSize: '13px' }}>
                Paid · Ref {payment.transactionRef}
              </div>
            )}
            <Button variant="ghost" style={{ width: '100%', marginTop: '10px' }} onClick={() => { setPayment(null); setSelectedOrderId(''); }}>
              New checkout
            </Button>
          </>
        )}
      </Card>
    </AppLayout>
  );
}