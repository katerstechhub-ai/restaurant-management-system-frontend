import client from './client';

export async function generateBill(orderId, { discount, extraCharges, method }) {
  const body = { method };
  if (discount !== undefined) body.discount = discount;
  if (extraCharges !== undefined) body.extraCharges = extraCharges;
  const res = await client.post(`/billing/${orderId}`, body);
  return res.data;
}

export async function processPayment(paymentId) {
  const res = await client.post(`/billing/${paymentId}/pay`);
  return res.data;
}

export async function getTransactions() {
  const res = await client.get('/billing');
  return res.data;
}

export async function getTransactionById(paymentId) {
  const res = await client.get(`/billing/${paymentId}`);
  return res.data;
}
