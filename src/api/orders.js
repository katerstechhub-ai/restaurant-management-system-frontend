import client from './client';

export async function createOrder({ items, orderType, table, payWithWallet, deliveryAddress }) {
  const body = { items, orderType };
  if (table) body.table = table;
  if (payWithWallet) body.payWithWallet = payWithWallet;
  if (deliveryAddress) body.deliveryAddress = deliveryAddress;
  const res = await client.post('/orders', body);
  return res.data;
}

// Card-payment path — call this after the Paystack popup reports success.
// The order is only created server-side once the reference is verified.
export async function payOrderWithCard({ reference, items, orderType, table, deliveryAddress }) {
  const body = { reference, items, orderType };
  if (table) body.table = table;
  if (deliveryAddress) body.deliveryAddress = deliveryAddress;
  const res = await client.post('/orders/pay', body);
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