import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getKitchenOrders, updateKitchenOrderStatus } from '../api/maleek';
import { PageTitle, Card, Button, StatusPill, ErrorText } from '../components/ui';
import { colors, radius, shadow } from '../styles/tokens';
import { Clock } from 'lucide-react';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
    // Poll every 30 seconds for new orders
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getKitchenOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to load kitchen queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateKitchenOrderStatus(id, newStatus);
      loadOrders(); // reload to reflect changes
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#FFA800';
      case 'preparing': return '#3498db';
      case 'ready': return '#4caf50';
      default: return colors.textMuted;
    }
  };

  return (
    <AdminLayout>
      <PageTitle description="Incoming orders queue and preparation status">Kitchen Dashboard</PageTitle>

      {error && <ErrorText>{error}</ErrorText>}

      {loading && orders.length === 0 ? (
        <p>Loading queue...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {orders.map(order => (
            <Card key={order._id} style={{ display: 'flex', flexDirection: 'column', borderTop: `4px solid ${getStatusColor(order.status)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Order #{order._id.slice(-5).toUpperCase()}</h3>
                  <div style={{ color: colors.textMuted, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <StatusPill status={order.status} color={getStatusColor(order.status)} />
              </div>

              <div style={{ flex: 1, background: colors.panelAlt, padding: '12px', borderRadius: radius.sm, marginBottom: '16px' }}>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      <span style={{ fontWeight: 600 }}>{item.quantity}x</span> {item.menuItem?.name || 'Unknown Item'}
                      {item.customizations && item.customizations.length > 0 && (
                        <div style={{ color: colors.textMuted, fontSize: '12px', marginTop: '2px' }}>
                          Note: {item.customizations.join(', ')}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {order.status === 'pending' && (
                  <Button variant="soft" style={{ flex: 1, color: '#3498db' }} onClick={() => handleStatusUpdate(order._id, 'preparing')}>
                    Start Preparing
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button variant="soft" style={{ flex: 1, color: '#4caf50' }} onClick={() => handleStatusUpdate(order._id, 'ready')}>
                    Mark Ready
                  </Button>
                )}
                {order.status === 'ready' && (
                  <div style={{ width: '100%', textAlign: 'center', color: '#4caf50', fontSize: '13px', padding: '10px 0', fontWeight: 600 }}>
                    Waiting for pickup
                  </div>
                )}
              </div>
            </Card>
          ))}
          {orders.length === 0 && !loading && (
            <p style={{ color: colors.textMuted }}>No active orders in the queue.</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
