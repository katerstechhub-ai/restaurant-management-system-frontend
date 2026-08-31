import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getTables, assignWalkIn } from '../api/maleek';
import { PageTitle, Card, Button, Input, StatusPill, ErrorText } from '../components/ui';
import { colors, radius, shadow } from '../styles/tokens';
import { Users } from 'lucide-react';

// Maleek's /tables endpoint is still being built out, so the exact response
// shape (bare array vs. { tables: [...] } vs. { data: [...] }) isn't locked
// down yet. Without this, `tables.map(...)` below throws the moment the
// shape doesn't match, and — since there's no error boundary catching it —
// that was taking the whole page blank. Normalizing here means the page
// renders (with an empty state) no matter which shape comes back.
function toTableArray(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.tables)) return res.tables;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

export default function FloorPlan() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Walk-in modal state
  const [selectedTable, setSelectedTable] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [walkInError, setWalkInError] = useState('');

  const loadTables = async () => {
    try {
      const data = await getTables();
      setTables(toTableArray(data));
    } catch {
      setError('Failed to load tables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleWalkIn = async (e) => {
    e.preventDefault();
    setWalkInError('');
    if (!selectedTable) return;
    if (partySize > selectedTable.capacity) {
      return setWalkInError(`Table capacity is only ${selectedTable.capacity}.`);
    }

    try {
      await assignWalkIn({ tableId: selectedTable._id, partySize });
      setSelectedTable(null);
      loadTables();
    } catch (err) {
      setWalkInError(err.response?.data?.message || err.message || 'Failed to assign walk-in');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return '#4caf50';
      case 'reserved': return '#FFA800';
      case 'occupied': return '#E84A3B';
      default: return colors.textMuted;
    }
  };

  return (
    <AdminLayout>
      <PageTitle subtitle="Visual layout and walk-in assignments">Floor Plan</PageTitle>

      {error && <ErrorText>{error}</ErrorText>}

      {loading ? (
        <p>Loading tables...</p>
      ) : tables.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px', color: colors.textMuted }}>
          No tables set up yet.
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {tables.map(table => (
            <div
              key={table._id}
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderTop: `4px solid ${getStatusColor(table.status)}`,
                borderRadius: radius.md,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: shadow.md
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Table {table.tableNumber}</h3>
                <StatusPill status={table.status} color={getStatusColor(table.status)} />
              </div>
              
              <div style={{ color: colors.textMuted, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} /> Capacity: {table.capacity}
              </div>

              {table.status === 'available' && (
                <Button variant="soft" style={{ marginTop: 'auto' }} onClick={() => setSelectedTable(table)}>
                  Assign Walk-In
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedTable && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <Card style={{ width: '400px' }}>
            <h2 style={{ marginTop: 0 }}>Walk-In Assignment</h2>
            <p style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '20px' }}>
              Assigning Table {selectedTable.tableNumber} (Capacity: {selectedTable.capacity})
            </p>
            
            <form onSubmit={handleWalkIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input 
                label="Party Size" 
                type="number" 
                min="1" 
                max={selectedTable.capacity} 
                value={partySize}
                onChange={e => setPartySize(Number(e.target.value))}
                required 
              />
              <ErrorText>{walkInError}</ErrorText>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <Button variant="ghost" type="button" onClick={() => setSelectedTable(null)}>Cancel</Button>
                <Button type="submit">Confirm Walk-In</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}