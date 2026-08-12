import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '../../src/api/orders';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, Select, StatusPill, PageTitle, ErrorText } from '../components/ui';
import { statusColor } from '../styles/tokens';

const STATUSES = ['pending', 'in-progress', 'completed'];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const canManage = user && (user.role === 'admin' || user.role === 'staff');

  const load = () => {
    getOrders()
      .then((data) => setOrders(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (orderId, status) => {
    setError('');
    try {
      await updateOrderStatus(orderId, status);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const options = [];
  for (let i = 0; i < STATUSES.length; i++) {
    options.push(<option key={STATUSES[i]} value={STATUSES[i]}>{STATUSES[i]}</option>);
  }

  const rows = [];
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const itemLines = [];
    for (let j = 0; j < order.items.length; j++) {
      const it = order.items[j];
      const name = it.menuItem && it.menuItem.name ? it.menuItem.name : 'Item';
      itemLines.push(`${it.quantity}x ${name}`);
    }
    rows.push(
      <Card key={order._id} style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 600 }}>
              Order #{order._id.slice(-6)} {order.customer && order.customer.name ? `· ${order.customer.name}` : ''}
            </div>
            <div style={{ color: colors.textMuted, fontSize: '13px', marginTop: '4px' }}>{itemLines.join(', ')}</div>
            <div style={{ color: colors.textMuted, fontSize: '12px', marginTop: '4px' }}>
              {order.orderType} · ${Number(order.totalAmount).toFixed(2)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StatusPill status={order.status} color={statusColor(order.status)} />
            {canManage && (
              <Select
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                style={{ padding: '8px 10px' }}
              >
                {options}
              </Select>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <AppLayout>
      <PageTitle>{canManage ? 'Orders' : 'Your orders'}</PageTitle>
      <ErrorText>{error}</ErrorText>
      {loading ? (
        <div style={{ color: colors.textMuted }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ color: colors.textMuted }}>No orders yet.</div>
      ) : (
        rows
      )}
    </AppLayout>
  );
}
