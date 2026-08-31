import client from './client';

export async function getTables() {
  const res = await client.get('/tables');
  return res.data;
}