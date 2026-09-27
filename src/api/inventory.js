import client from './client';

export async function getInventory() {
  const res = await client.get('/inventory');
  return res.data;
}

export async function addInventoryItem({ itemName, quantity, unit, reorderPoint, supplierInfo, costPerUnit }) {
  const res = await client.post('/inventory', { itemName, quantity, unit, reorderPoint, supplierInfo, costPerUnit });
  return res.data;
}

export async function updateStock(id, { amount, type }) {
  const res = await client.put(`/inventory/${id}/stock`, { amount, type });
  return res.data;
}

export async function updateReorderPoint(id, reorderPoint) {
  const res = await client.put(`/inventory/${id}/stock`, { reorderPoint });
  return res.data;
}

// Market cost per unit — separate from stock quantity. Used for margin
// visibility only; never affects Menu.price.
export async function updateCost(id, costPerUnit) {
  const res = await client.patch(`/inventory/${id}/cost`, { costPerUnit });
  return res.data;
}