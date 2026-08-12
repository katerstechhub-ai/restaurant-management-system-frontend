import { useEffect, useState } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../../src/api/menu';
import { colors } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, Button, Input, PageTitle, ErrorText } from '../components/ui';

const EMPTY_FORM = { name: '', description: '', price: '', category: '', available: true };

export default function MenuAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    getMenuItems()
      .then((data) => setItems(data))
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        available: form.available,
      };
      if (editingId) {
        await updateMenuItem(editingId, payload);
      } else {
        await createMenuItem(payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      category: item.category || '',
      available: item.available,
    });
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await deleteMenuItem(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const rows = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    rows.push(
      <div
        key={item._id}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div>
          <div style={{ fontWeight: 600 }}>{item.name}</div>
          <div style={{ color: colors.textMuted, fontSize: '12px' }}>
            {item.category || 'Uncategorized'} · ${Number(item.price).toFixed(2)} · {item.available ? 'Available' : 'Unavailable'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="ghost" onClick={() => startEdit(item)}>Edit</Button>
          <Button variant="ghost" onClick={() => handleDelete(item._id)}>Delete</Button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <PageTitle>Manage Menu</PageTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' }}>
        <Card>
          <h2 style={{ fontSize: '15px', marginBottom: '16px' }}>{editingId ? 'Edit item' : 'New item'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input label="Price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.textMuted }}>
              <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
              Available
            </label>
            <ErrorText>{error}</ErrorText>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="submit" disabled={busy}>{editingId ? 'Save changes' : 'Add item'}</Button>
              {editingId && <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>}
            </div>
          </form>
        </Card>

        <Card>
          <h2 style={{ fontSize: '15px', marginBottom: '8px' }}>All items ({items.length})</h2>
          {rows}
        </Card>
      </div>
    </AppLayout>
  );
}
