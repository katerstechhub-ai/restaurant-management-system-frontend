import client from './client';

// Reservations
export async function getAvailableSlots(date) {
  const res = await client.get(`/reservations/available?date=${date}`);
  return res.data;
}

export async function createReservation(data) {
  const res = await client.post('/reservations', data);
  return res.data;
}

export async function cancelReservation(id) {
  const res = await client.delete(`/reservations/${id}`);
  return res.data;
}

// Floor Plan & Tables
export async function getTables() {
  const res = await client.get('/tables');
  return res.data;
}

export async function addTable(data) {
  const res = await client.post('/tables', data);
  return res.data;
}

export async function assignWalkIn(data) {
  const res = await client.post(`/tables/walk-in`, data);
  return res.data;
}

// Kitchen Dashboard
export async function getKitchenOrders() {
  const res = await client.get('/kitchen/queue');
  return res.data;
}

export async function updateKitchenOrderStatus(id, status) {
  const res = await client.put(`/kitchen/orders/${id}/status`, { status });
  return res.data;
}

// Inventory
export async function getInventory() {
  const res = await client.get('/inventory');
  return res.data;
}

export async function addInventoryItem(data) {
  const res = await client.post('/inventory', data);
  return res.data;
}

export async function updateStock(id, fields) {
  const res = await client.put(`/inventory/${id}/stock`, fields);
  return res.data;
}
