import client from './client';

export async function getAllUsers() {
  const res = await client.get('/users');
  return res.data;
}

export async function createUser(data) {
  const res = await client.post('/users', data);
  return res.data;
}

export async function updateUserRole(id, role) {
  const res = await client.put(`/users/${id}/role`, { role });
  return res.data;
}