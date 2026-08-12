import { useEffect, useState } from 'react';
import { ClipboardList, Clock, Bike, UtensilsCrossed } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { colors, statusColor, radius, font } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, Select, StatusPill, PageTitle, ErrorText, EmptyState, Thumb } from '../components/ui';

const STATUSES = ['pending', 'in-progress', 'completed'];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const canManage = user && (user.role === 'admin' || user.role === 'staff');

  const load = () => {
    getOrders()
      .then(setOrders)
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

  const counts = STATUSES.map((s) => ({ status: s, n: orders.filter((o) => o.status === s).length }));

  return (
    <AppLayout>
      <PageTitle subtitle={`${orders.length} orders in the system`}>
        {canManage ? 'Orders' : 'Your orders'}
      </PageTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {counts.map(({ status, n }) => (
          <Card key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: `${statusColor(status)}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: statusColor(status),
              }}
            >
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontFamily: font.display, fontSize: '20px', fontWeight: 700 }}>{n}</div>
              <div style={{ color: colors.textMuted, fontSize: '11px', textTransform: 'capitalize' }}>{status}</div>
            </div>
          </Card>
        ))}
      </div>

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <div style={{ color: colors.textMuted }}>Loading orders…</div>
      ) : orders.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders yet" hint="New orders will appear here in real time." />
      ) : (
        orders.map((order) => (
          <Card key={order._id} hover style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '14px', minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '-8px' }}>
                  {order.items.slice(0, 3).map((it, idx) => (
                    <div key={idx} style={{ marginLeft: idx === 0 ? 0 : '-14px' }}>
                      <Thumb src={it.menuItem && it.menuItem.imageUrl} alt={(it.menuItem && it.menuItem.name) || 'Item'} size={48} />
                    </div>
                  ))}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: font.display, fontWeight: 700 }}>
                    Order #{order._id.slice(-6)}
                    {order.customer && order.customer.name ? ` · ${order.customer.name}` : ''}
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: '13px', marginTop: '5px' }}>
                    {order.items
                      .map((it) => `${it.quantity}x ${it.menuItem && it.menuItem.name ? it.menuItem.name : 'Item'}`)
                      .join(', ')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMuted, fontSize: '12px', marginTop: '6px' }}>
                    {order.orderType === 'delivery' ? <Bike size={13} /> : <UtensilsCrossed size={13} />}
                    <span style={{ textTransform: 'capitalize' }}>{order.orderType}</span>
                    <span>·</span>
                    <span style={{ color: colors.accent, fontWeight: 700 }}>${Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <StatusPill status={order.status} color={statusColor(order.status)} />
                {canManage && (
                  <Select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    style={{ padding: '9px 12px', width: 'auto', borderRadius: radius.pill }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </AppLayout>
  );
}
