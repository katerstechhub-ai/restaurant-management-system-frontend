import { useEffect, useState } from 'react';
import { ClipboardList, Clock, Bike, UtensilsCrossed, Eye, EyeOff } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { colors, statusColor, radius, font } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import AdminLayout from '../components/AdminLayout';
import { Card, Select, StatusPill, PageTitle, ErrorText, EmptyState } from '../components/ui';

const STATUSES = ['pending', 'in-progress', 'completed'];

// Same treatment as the menu cards: rounded square, cropped photo, and an
// icon medallion fallback when the item has no image.
function ItemThumb({ src, alt, size = 52 }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: radius.sm,
        overflow: 'hidden',
        border: `1px solid ${colors.border}`,
        background: colors.panelAlt,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <UtensilsCrossed size={Math.round(size * 0.4)} color={colors.textMuted} />
      )}
    </div>
  );
}

// Small pill toggle used to reveal/hide completed orders. Kept local to this
// file since it's a one-off control, styled to match Select/StatusPill.
function ShowCompletedToggle({ show, onToggle, count }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '9px 14px',
        borderRadius: radius.pill,
        border: `1px solid ${colors.border}`,
        background: show ? `${colors.accent}15` : colors.panel,
        color: show ? colors.accent : colors.textMuted,
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.15s ease, color 0.15s ease',
      }}
    >
      {show ? <Eye size={14} /> : <EyeOff size={14} />}
      {show ? 'Hide completed' : `Show completed (${count})`}
    </button>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const canManage = user && (user.role === 'admin' || user.role === 'staff');
  const Layout = canManage ? AdminLayout : AppLayout;

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
  const completedCount = counts.find((c) => c.status === 'completed')?.n ?? 0;
  const visibleOrders = showCompleted ? orders : orders.filter((o) => o.status !== 'completed');

  return (
    <Layout title={canManage ? 'Orders' : 'Your orders'}>
      <PageTitle subtitle={`${orders.length} orders in the system`}>
        {canManage ? 'Orders' : 'Your orders'}
      </PageTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '20px' }}>
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

      {completedCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
          <ShowCompletedToggle
            show={showCompleted}
            onToggle={() => setShowCompleted((v) => !v)}
            count={completedCount}
          />
        </div>
      )}

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <div style={{ color: colors.textMuted }}>Loading orders…</div>
      ) : orders.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders yet" hint="New orders will appear here in real time." />
      ) : visibleOrders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No active orders"
          hint={`All ${completedCount} orders are completed. Toggle "Show completed" above to see them.`}
        />
      ) : (
        visibleOrders.map((order) => (
          <Card key={order._id} hover style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '14px', minWidth: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                  {order.items.slice(0, 3).map((it, idx) => (
                    <ItemThumb
                      key={idx}
                      src={it.menuItem && it.menuItem.image}
                      alt={(it.menuItem && it.menuItem.name) || 'Item'}
                    />
                  ))}
                  {order.items.length > 3 && (
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '11px',
                        color: colors.textMuted,
                        fontWeight: 600,
                      }}
                    >
                      +{order.items.length - 3}
                    </div>
                  )}
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
                    <span style={{ color: colors.accent, fontWeight: 700 }}>₦{Number(order.totalAmount).toFixed(2)}</span>
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
    </Layout>
  );
}