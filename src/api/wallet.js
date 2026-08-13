import client from './client';

export const getWallet = () =>
  client.get('/wallet').then((res) => res.data);

export const getWalletTransactions = () =>
  client.get('/wallet/transactions').then((res) => res.data);

export const verifyTopUp = (reference) =>
  client.post('/wallet/verify', { reference }).then((res) => res.data);