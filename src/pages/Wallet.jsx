import { useEffect, useState } from 'react';
import { Wallet as WalletIcon, Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { getWallet, getWalletTransactions, topUpWallet } from '../api/wallet';
import { colors, font, radius } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, Button, Input, PageTitle, ErrorText, EmptyState } from '../components/ui';

const METHODS = ['card', 'mobile', 'cash'];

export default function Wallet() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    getWallet().then((res) => setBalance(res.balance)).catch((err) => setError(err.message));
    getWalletTransactions().then(setTransactions).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const handleTopUp = async (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }

    setBusy(true);
    try {
      await topUpWallet({ amount: numAmount, method });
      setAmount('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout title="Wallet">
      <PageTitle subtitle="Top up your balance and track wallet activity">Wallet</PageTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: radius.sm, background: colors.accentSoft ?? colors.panelAlt,
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <WalletIcon size={20} color={colors.accent} />
              </div>
              <div>
                <div style={{ color: colors.textMuted, fontSize: '12px' }}>Current balance</div>
                <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: '26px' }}>
                  {balance === null ? '—' : `$${Number(balance).toFixed(2)}`}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 style={{ fontFamily: font.display, fontSize: '15px', margin: '0 0 18px' }}>Top up</h2>
            <form onSubmit={handleTopUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: colors.textMuted, marginBottom: '8px' }}>
                  Payment method
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: radius.sm,
                        border: `1px solid ${method === m ? colors.accent : colors.border}`,
                        background: method === m ? colors.accentSoft ?? colors.panelAlt : 'transparent',
                        color: method === m ? colors.accent : colors.textMuted,
                        fontFamily: font.body, fontSize: '12px', fontWeight: 600,
                        textTransform: 'capitalize', cursor: 'pointer',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <ErrorText>{error}</ErrorText>

              <Button type="submit" disabled={busy}>
                <Plus size={15} /> Add funds
              </Button>
            </form>
          </Card>
        </div>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontFamily: font.display, fontSize: '15px', margin: 0 }}>Activity</h2>
            <span style={{ color: colors.textMuted, fontSize: '12px' }}>{transactions.length} total</span>
          </div>

          {transactions.length === 0 ? (
            <EmptyState icon={WalletIcon} title="No activity yet" hint="Top up your wallet to get started." />
          ) : (
            transactions.map((tx) => (
              <div
                key={tx._id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 0', borderBottom: `1px solid ${colors.border}`,
                }}
              >
                {tx.type === 'topup' ? (
                  <ArrowUpCircle size={20} color={colors.success ?? '#3fb950'} />
                ) : (
                  <ArrowDownCircle size={20} color={colors.accent} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {tx.type === 'topup' ? 'Top-up' : 'Deduction'}
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: '12px', marginTop: '4px' }}>
                    {new Date(tx.createdAt).toLocaleString()} · {tx.method}
                  </div>
                </div>
                <div style={{
                  fontWeight: 700,
                  color: tx.type === 'topup' ? (colors.success ?? '#3fb950') : colors.accent,
                }}>
                  {tx.type === 'topup' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </AppLayout>
  );
}