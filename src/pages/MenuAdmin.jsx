import { useEffect, useState } from 'react';
import { Pencil, Trash2, X, Check, ImagePlus, UtensilsCrossed, Loader2, Plus } from 'lucide-react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../api/menu';
import { getInventory } from '../api/inventory';
import { uploadImageToCloudinary } from '../api/uploads';
import { colors, radius, font } from '../styles/tokens';
import AdminLayout from '../components/AdminLayout';
import { Card, Button, Input, Select, PageTitle, ErrorText, Thumb, EmptyState } from '../components/ui';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  prepTimeMinutes: '',
  available: true,
  ingredients: [], // [{ inventoryItem: '<id>', quantityUsed: '<string>' }]
};

export default function MenuAdmin() {
  const [items, setItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const load = () => {
    getMenuItems().then(setItems).catch((err) => setError(err.message));
  };

  // Needed for the recipe editor's ingredient picker — separate from `load`
  // above since inventory rarely changes while editing a menu item, no
  // need to refetch it on every menu-item save.
  const loadInventory = () => {
    getInventory().then(setInventoryItems).catch(() => {
      // Recipe editor just won't have options if this fails — menu items
      // can still be created/edited without a recipe either way.
    });
  };

  useEffect(load, []);
  useEffect(loadInventory, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addIngredientRow = () => {
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, { inventoryItem: '', quantityUsed: '' }] }));
  };

  const updateIngredientRow = (index, key, value) => {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    }));
  };

  const removeIngredientRow = (index) => {
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== index) }));
  };

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

    // Drop incomplete rows silently (e.g. an ingredient row added but never
    // filled in) rather than blocking submission or sending garbage.
    const cleanIngredients = form.ingredients
      .filter((row) => row.inventoryItem && Number(row.quantityUsed) > 0)
      .map((row) => ({ inventoryItem: row.inventoryItem, quantityUsed: Number(row.quantityUsed) }));

    setBusy(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image: form.image,
        prepTimeMinutes: form.prepTimeMinutes === '' ? undefined : Number(form.prepTimeMinutes),
        available: form.available,
        ingredients: cleanIngredients,
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
      prepTimeMinutes: item.prepTimeMinutes !== undefined && item.prepTimeMinutes !== null ? String(item.prepTimeMinutes) : '',
      available: item.available,
      // item.ingredients comes back populated (inventoryItem is an object,
      // not just an id) — unwrap it back to the id the <select> needs.
      ingredients: (item.ingredients || []).map((ing) => ({
        inventoryItem: ing.inventoryItem?._id || ing.inventoryItem || '',
        quantityUsed: String(ing.quantityUsed ?? ''),
      })),
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

  const inventoryLabel = (id) => {
    const found = inventoryItems.find((inv) => inv._id === id);
    return found ? `${found.itemName} (${found.unit})` : '';
  };

  return (
    <AdminLayout title="Manage Menu">
      <PageTitle subtitle="Create, update and retire dishes">Manage Menu</PageTitle>

      {/* auto-fit lets this collapse to a single column once the viewport can't
          fit two 320px-minimum columns side by side — no media query needed */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <Card>
          <h2 style={{ fontFamily: font.display, fontSize: '15px', margin: '0 0 18px' }}>
            {editingId ? 'Edit item' : 'New item'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Thumb src={form.image} alt="Preview" size={72} radiusPx={16} />
              <label
                style={{
                  flex: '1 1 180px',
                  minWidth: '180px',
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
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
                <Input label="Price" type="number" step="0.01" min="0" value={form.price} onChange={setField('price')} required />
              </div>
              <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
                <Input label="Category" value={form.category} onChange={setField('category')} />
              </div>
            </div>
            <Input
              label="Prep time (minutes)"
              type="number"
              min="0"
              placeholder="e.g. 20"
              value={form.prepTimeMinutes}
              onChange={setField('prepTimeMinutes')}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: colors.textMuted }}>
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
                style={{ accentColor: colors.accent, width: '16px', height: '16px' }}
              />
              Available
            </label>

            {/* Recipe editor — optional. Leaving this empty keeps the dish
                exactly as it behaved before recipes existed: no inventory
                decrement, no estimated cost. */}
            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textMuted }}>
                  Recipe (optional)
                </span>
                <Button type="button" variant="soft" style={{ padding: '6px 10px', fontSize: '12px' }} onClick={addIngredientRow}>
                  <Plus size={13} /> Add ingredient
                </Button>
              </div>

              {form.ingredients.length === 0 ? (
                <div style={{ color: colors.textMuted, fontSize: '12px' }}>
                  No ingredients linked — this dish won't reduce inventory or show an estimated cost.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {form.ingredients.map((row, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: '2 1 160px' }}>
                        <Select
                          value={row.inventoryItem}
                          onChange={(e) => updateIngredientRow(index, 'inventoryItem', e.target.value)}
                        >
                          <option value="">Select ingredient…</option>
                          {inventoryItems.map((inv) => (
                            <option key={inv._id} value={inv._id}>
                              {inv.itemName} ({inv.unit})
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div style={{ flex: '1 1 90px' }}>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Qty used"
                          value={row.quantityUsed}
                          onChange={(e) => updateIngredientRow(index, 'quantityUsed', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        aria-label="Remove ingredient"
                        onClick={() => removeIngredientRow(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '6px',
                          cursor: 'pointer',
                          color: colors.textMuted,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <ErrorText>{error}</ErrorText>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontFamily: font.display, fontSize: '15px', margin: 0 }}>All items</h2>
            <span style={{ color: colors.textMuted, fontSize: '12px' }}>{items.length} total</span>
          </div>

          {items.length === 0 ? (
            <EmptyState icon={UtensilsCrossed} title="No items yet" hint="Add your first dish on the left." />
          ) : (
            items.map((item) => {
              const hasCost = item.estimatedCost !== null && item.estimatedCost !== undefined;
              const margin = hasCost ? Number(item.price) - item.estimatedCost : null;

              return (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 0',
                    borderBottom: `1px solid ${colors.border}`,
                    flexWrap: 'wrap',
                  }}
                >
                  <Thumb src={item.image} alt={item.name} />
                  <div style={{ flex: '1 1 160px', minWidth: '160px' }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: colors.textMuted, fontSize: '12px', marginTop: '4px' }}>
                      {item.category || 'Uncategorized'} · ₦{Number(item.price).toFixed(2)}
                      {item.prepTimeMinutes ? ` · ${item.prepTimeMinutes} min` : ''} ·{' '}
                      <span style={{ color: item.available ? colors.success : colors.accent }}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    {hasCost && (
                      <div style={{ color: colors.textMuted, fontSize: '11px', marginTop: '3px' }}>
                        Est. cost ₦{item.estimatedCost.toFixed(2)} · margin{' '}
                        <span style={{ color: margin >= 0 ? colors.success : colors.accent, fontWeight: 600 }}>
                          ₦{margin.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    <Button variant="soft" style={{ padding: '9px 12px' }} onClick={() => startEdit(item)}>
                      <Pencil size={15} />
                    </Button>
                    <Button variant="ghost" style={{ padding: '9px 12px', color: colors.accent }} onClick={() => handleDelete(item._id)}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}