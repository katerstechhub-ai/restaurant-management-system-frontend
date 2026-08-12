import { useEffect, useState } from 'react';
import { Banknote, CreditCard, Smartphone, Receipt } from 'lucide-react';
import { getTransactions } from '../api/billing';
import { colors, statusColor, font } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, StatusPill, PageTitle, ErrorText, EmptyState } from '../components/ui';

const METHOD_ICONS = { cash: Banknote, card: CreditCard, mobile: Smartphone };

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const revenue = transactions
    .filter((t) => t.status === 'paid')
    .reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);

  return (
    <AppLayout>
      <PageTitle subtitle={`${transactions.length} records · $${revenue.toFixed(2)} collected`}>
        Transaction history
      </PageTitle>

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <div style={{ color: colors.textMuted }}>Loading transactions…</div>
      ) : transactions.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions yet" hint="Completed payments will show up here." />
      ) : (
        transactions.map((tx) => {
          const Icon = METHOD_ICONS[tx.method] || Receipt;
          return (
            <Card key={tx._id} hover style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '13px',
                    background: colors.panelAlt,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.textMuted,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>
                    #{tx._id.slice(-6)}
                    {tx.customer && tx.customer.name ? ` · ${tx.customer.name}` : ''}
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: '12px', marginTop: '4px', textTransform: 'capitalize' }}>
                    {tx.method} · {new Date(tx.createdAt).toLocaleDateString()}
                    {tx.transactionRef ? ` · Ref ${tx.transactionRef}` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: '15px' }}>
                    ${Number(tx.totalAmount).toFixed(2)}
                  </div>
                  <StatusPill status={tx.status} color={statusColor(tx.status)} />
                </div>
              </div>
            </Card>
          );
        })
      )}
    </AppLayout>
  );
}
