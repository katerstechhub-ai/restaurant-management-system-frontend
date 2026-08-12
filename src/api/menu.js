import client from './client';

export async function getMenuItems() {
  const res = await client.get('/menu');
  return res.data;
}

export async function getMenuItemById(id) {
  const res = await client.get(`/menu/${id}`);
  return res.data;
}

export async function createMenuItem({ name, description, price, category, available }) {
  const res = await client.post('/menu', { name, description, price, category, available });
  return res.data;
}

export async function updateMenuItem(id, fields) {
  const res = await client.put(`/menu/${id}`, fields);
  return res.data;
}

export async function deleteMenuItem(id) {
  const res = await client.delete(`/menu/${id}`);
  return res.data;
}
