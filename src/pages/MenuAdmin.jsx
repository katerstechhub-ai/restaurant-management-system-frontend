import { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Check, ImagePlus, UtensilsCrossed, Loader2 } from 'lucide-react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../api/menu';
import { uploadImageToCloudinary } from '../api/uploads';
import { colors, radius, font } from '../styles/tokens';
import AdminLayout from '../components/AdminLayout';
import { Card, Button, Input, PageTitle, ErrorText, Thumb, EmptyState } from '../components/ui';

const EMPTY_FORM = { name: '', description: '', price: '', category: '', image: '', available: true };

export default function MenuAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const load = () => {
    getMenuItems().then(setItems).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setError('');
    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadImageToCloudinary(file, setUploadProgress);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
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
        image: form.image,
        available: form.available,
      };
      if (editingId) await updateMenuItem(editingId, payload);
      else await createMenuItem(payload);
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
      image: item.image || '',
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

  return (
    <AdminLayout title="Manage Menu">
      <PageTitle subtitle="Create, update and retire dishes">Manage Menu</PageTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '24px', alignItems: 'start' }}>
        <Card>
          <h2 style={{ fontFamily: font.display, fontSize: '15px', margin: '0 0 18px' }}>
            {editingId ? 'Edit item' : 'New item'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <Thumb src={form.image} alt="Preview" size={72} radiusPx={16} />
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: `1px dashed ${colors.border}`,
                  borderRadius: radius.sm,
                  padding: '18px 12px',
                  color: uploading ? colors.accent : colors.textMuted,
                  fontSize: '12px',
                  cursor: uploading ? 'default' : 'pointer',
                  opacity: uploading ? 0.85 : 1,
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="spin" style={{ animation: 'spin 0.8s linear infinite' }} />
                    Uploading… {uploadProgress}%
                  </>
                ) : (
                  <>
                    <ImagePlus size={16} /> Upload image
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <Input label="Name" value={form.name} onChange={setField('name')} required />
            <Input label="Description" value={form.description} onChange={setField('description')} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <Input label="Price" type="number" step="0.01" min="0" value={form.price} onChange={setField('price')} required />
              <Input label="Category" value={form.category} onChange={setField('category')} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: colors.textMuted }}>
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
                style={{ accentColor: colors.accent, width: '16px', height: '16px' }}
              />
              Available
            </label>

            <ErrorText>{error}</ErrorText>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="submit" disabled={busy || uploading}>
                <Check size={15} /> {editingId ? 'Save changes' : 'Add item'}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  <X size={15} /> Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontFamily: font.display, fontSize: '15px', margin: 0 }}>All items</h2>
            <span style={{ color: colors.textMuted, fontSize: '12px' }}>{items.length} total</span>
          </div>

          {items.length === 0 ? (
            <EmptyState icon={UtensilsCrossed} title="No items yet" hint="Add your first dish on the left." />
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 0',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <Thumb src={item.image} alt={item.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: colors.textMuted, fontSize: '12px', marginTop: '4px' }}>
                    {item.category || 'Uncategorized'} · ₦{Number(item.price).toFixed(2)} ·{' '}
                    <span style={{ color: item.available ? colors.success : colors.accent }}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="soft" style={{ padding: '9px 12px' }} onClick={() => startEdit(item)}>
                    <Pencil size={15} />
                  </Button>
                  <Button variant="ghost" style={{ padding: '9px 12px', color: colors.accent }} onClick={() => handleDelete(item._id)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}