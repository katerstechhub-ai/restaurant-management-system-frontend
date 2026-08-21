import client from './client';

// Customer Profiles (CRM)
export async function getCustomers() {
  const res = await client.get('/customers');
  return res.data;
}

export async function getCustomerById(id) {
  const res = await client.get(`/customers/${id}`);
  return res.data;
}

export async function updateCustomerPreferences(id, preferences) {
  const res = await client.put(`/customers/${id}/preferences`, { preferences });
  return res.data;
}

export async function addCustomerFeedback(id, data) {
  const res = await client.post(`/customers/${id}/feedback`, data);
  return res.data;
}

export async function getCustomerSegments() {
  const res = await client.get('/customers/segments');
  return res.data;
}

// Support / Interaction Tracker
export async function getSupportTickets() {
  const res = await client.get('/support');
  return res.data;
}

export async function createSupportTicket(data) {
  const res = await client.post('/support', data);
  return res.data;
}

export async function updateSupportTicket(id, fields) {
  const res = await client.put(`/support/${id}`, fields);
  return res.data;
}

// Analytics
export async function getSalesTrends() {
  const res = await client.get('/reports/sales-trends');
  return res.data;
}

export async function getTopDishes() {
  const res = await client.get('/reports/top-dishes');
  return res.data;
}

// Reports
export async function generateReport(type, from, to) {
  const res = await client.post(
    '/reports/generate',
    { type, from, to },
    { responseType: 'blob' }
  );
  return res.data;
}