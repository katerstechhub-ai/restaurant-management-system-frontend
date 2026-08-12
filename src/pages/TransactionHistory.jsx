import { useEffect, useState } from 'react';
import { getTransactions } from '../../src/api/billing';
import { colors, statusColor } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, StatusPill, PageTitle, ErrorText } from '../components/ui';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then((data) => setTransactions(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const rows = [];
  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    rows.push(
      <Card key={tx._id} style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>
              #{tx._id.slice(-6)} {tx.customer && tx.customer.name ? `· ${tx.customer.name}` : ''}
            </div>
            <div style={{ color: colors.textMuted, fontSize: '12px', marginTop: '4px' }}>
              {tx.method} · {new Date(tx.createdAt).toLocaleDateString()}
              {tx.transactionRef ? ` · Ref ${tx.transactionRef}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontWeight: 700 }}>${Number(tx.totalAmount).toFixed(2)}</div>
            <StatusPill status={tx.status} color={statusColor(tx.status)} />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <AppLayout>
      <PageTitle>Transaction history</PageTitle>
      <ErrorText>{error}</ErrorText>
      {loading ? (
        <div style={{ color: colors.textMuted }}>Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div style={{ color: colors.textMuted }}>No transactions yet.</div>
      ) : (
        rows
      )}
    </AppLayout>
  );
}
