import client from './client';

export async function registerUser({ name, email, password, role }) {
  const body = { name, email, password };
  if (role) body.role = role;
  const res = await client.post('/auth/register', body);
  return res.data;
}

export async function loginUser({ email, password }) {
  const res = await client.post('/auth/login', { email, password });
  return res.data;
}

export async function getMe() {
  const res = await client.get('/auth/me');
  return res.data;
}

export async function forgotPassword({ email }) {
  const res = await client.post('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPassword({ token, password }) {
  const res = await client.post(`/auth/reset-password/${token}`, { password });
  return res.data;
}
