import client from './client';

export async function createOrder({ items, orderType, table, paymentMethod }) {
  const body = { items, orderType, paymentMethod };
  if (table) body.table = table;
  const res = await client.post('/orders', body);
  return res.data;
}

export async function verifyOrderPayment(orderId, reference) {
  const res = await client.post(`/orders/${orderId}/verify-payment`, { reference });
  return res.data;
}

export async function getOrders() {
  const res = await client.get('/orders');
  return res.data;
}

export async function getOrderById(id) {
  const res = await client.get(`/orders/${id}`);
  return res.data;
}

export async function updateOrderStatus(id, status) {
  const res = await client.patch(`/orders/${id}/status`, { status });
  return res.data;
}