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

export async function updateCustomerPreferences(id, data) {
  const res = await client.put(`/customers/${id}/preferences`, data);
  return res.data;
}

// Support / Interaction Tracker
export async function getSupportTickets() {
  const res = await client.get('/support/tickets');
  return res.data;
}

export async function createSupportTicket(data) {
  const res = await client.post('/support/tickets', data);
  return res.data;
}

export async function updateSupportTicket(id, fields) {
  const res = await client.put(`/support/tickets/${id}`, fields);
  return res.data;
}

// Analytics
export async function getSalesTrends(range) {
  const res = await client.get(`/analytics/sales?range=${range}`);
  return res.data;
}

export async function getTopSellingDishes(range) {
  const res = await client.get(`/analytics/top-dishes?range=${range}`);
  return res.data;
}

export async function getCustomerSegments() {
  const res = await client.get('/analytics/customer-segments');
  return res.data;
}

// Reports
export async function generateReport(type, dateRange) {
  const res = await client.post('/reports/generate', { type, dateRange });
  return res.data;
}