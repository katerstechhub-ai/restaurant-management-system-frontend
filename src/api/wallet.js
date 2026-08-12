import client from './client';

export async function getWallet() {
  const res = await client.get('/wallet');
  return res.data;
}

export async function getWalletTransactions() {
  const res = await client.get('/wallet/transactions');
  return res.data;
}

export async function topUpWallet({ amount, method }) {
  const res = await client.post('/wallet/topup', { amount, method });
  return res.data;
}