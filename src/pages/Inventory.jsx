import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getInventory, addInventoryItem, updateStock } from '../api/maleek';
import { PageTitle, Card, Button, Input, Select, ErrorText, StatusPill } from '../components/ui';
import { colors, radius, shadow } from '../styles/tokens';
import { AlertTriangle, Plus, Minus } from 'lucide-react';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add item state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, unit: 'kg', reorderPoint: 5 });
  const [addError, setAddError] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventory();
      setInventory(data);
    } catch (err) {
      setError('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setAddError('');
    try {
      await addInventoryItem(newItem);
      setNewItem({ name: '', quantity: 0, unit: 'kg', reorderPoint: 5 });
      setShowAddForm(false);
      loadInventory();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleUpdateStock = async (id, delta, currentQuantity, currentReorderPoint) => {
    try {
      // Just passing the fields we want to update.
      // If delta is passed, we update quantity. If we just want to update reorderPoint, we can pass that.
      await updateStock(id, { quantity: currentQuantity + delta, reorderPoint: currentReorderPoint });
      loadInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleUpdateReorder = async (id, currentQuantity, newReorderPoint) => {
    try {
      await updateStock(id, { quantity: currentQuantity, reorderPoint: newReorderPoint });
      loadInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update reorder point');
    }
  };

  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderPoint);

  return (
    <AdminLayout>
      <PageTitle 
        description="Track stock levels and set reorder points"
        action={<Button onClick={() => setShowAddForm(true)}><Plus size={16} /> Add Item</Button>}
      >
        Inventory Management
      </PageTitle>

      {error && <ErrorText>{error}</ErrorText>}

      {lowStockItems.length > 0 && (
        <div style={{
          background: 'rgba(232, 74, 59, 0.1)',
          border: `1px solid ${colors.accent}`,
          color: colors.accent,
          padding: '16px',
          borderRadius: radius.md,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertTriangle size={20} />
          <div>
            <strong>Low Stock Alert:</strong> {lowStockItems.length} items are at or below their reorder points. 
            ({lowStockItems.map(i => i.name).join(', ')})
          </div>
        </div>
      )}

      {showAddForm && (
        <Card style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Add New Item</h3>
          <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <Input label="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
            <Input label="Quantity" type="number" min="0" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} required />
            <Select label="Unit" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}>
              <option value="kg">kg</option>
              <option value="liters">liters</option>
              <option value="pieces">pieces</option>
              <option value="packs">packs</option>
            </Select>
            <Input label="Reorder Pt" type="number" min="0" value={newItem.reorderPoint} onChange={e => setNewItem({...newItem, reorderPoint: Number(e.target.value)})} required />
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
          <ErrorText>{addError}</ErrorText>
        </Card>
      )}

      {loading ? (
        <p>Loading inventory...</p>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: colors.panelAlt, borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ padding: '16px', color: colors.textMuted, fontWeight: 600 }}>Item Name</th>
                <th style={{ padding: '16px', color: colors.textMuted, fontWeight: 600 }}>Stock Level</th>
                <th style={{ padding: '16px', color: colors.textMuted, fontWeight: 600 }}>Status</th>
                <th style={{ padding: '16px', color: colors.textMuted, fontWeight: 600 }}>Reorder Point</th>
                <th style={{ padding: '16px', color: colors.textMuted, fontWeight: 600, textAlign: 'right' }}>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, i) => {
                const isLow = item.quantity <= item.reorderPoint;
                return (
                  <tr key={item._id} style={{ borderBottom: i === inventory.length - 1 ? 'none' : `1px solid ${colors.border}` }}>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{item.name}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ color: isLow ? colors.accent : colors.text, fontWeight: isLow ? 700 : 400 }}>
                        {item.quantity}
                      </span> <span style={{ color: colors.textMuted, fontSize: '12px' }}>{item.unit}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {isLow ? <StatusPill status="Low Stock" color="#E84A3B" /> : <StatusPill status="Optimal" color="#4caf50" />}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <input 
                        type="number"
                        min="0"
                        defaultValue={item.reorderPoint}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if(val !== item.reorderPoint) handleUpdateReorder(item._id, item.quantity, val);
                        }}
                        style={{
                          background: 'rgba(20,20,20,0.8)', border: `1px solid ${colors.border}`, color: colors.text,
                          padding: '6px 10px', borderRadius: radius.sm, width: '70px', outline: 'none'
                        }}
                      />
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleUpdateStock(item._id, -1, item.quantity, item.reorderPoint)}
                          disabled={item.quantity <= 0}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', background: colors.panelAlt, border: `1px solid ${colors.border}`, color: colors.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Minus size={14} />
                        </button>
                        <button 
                          onClick={() => handleUpdateStock(item._id, 1, item.quantity, item.reorderPoint)}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', background: colors.panelAlt, border: `1px solid ${colors.border}`, color: colors.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: colors.textMuted }}>No inventory items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </AdminLayout>
  );
}