import { useEffect, useState } from 'react';
import { Wallet as WalletIcon, Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { getWallet, getWalletTransactions, verifyTopUp } from '../api/wallet';
import { colors, font, radius } from '../styles/tokens';
import AppLayout from '../components/AppLayout';
import { Card, Button, Input, PageTitle, ErrorText, EmptyState } from '../components/ui';
import { useAuth } from '../context/AuthContext'; // adjust to wherever you keep the logged-in user

export default function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 760 : false
  );

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 760);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const load = () => {
    getWallet().then((res) => setBalance(res.balance)).catch((err) => setError(err.message));
    getWalletTransactions().then(setTransactions).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const handlePay = () => {
    setError('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }

    if (!window.PaystackPop) {
      setError('Payment library not loaded. Refresh and try again.');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: Math.round(numAmount * 100), // kobo
      metadata: { userId: user._id },
      callback: (response) => {
        setBusy(true);
        verifyTopUp(response.reference)
          .then(() => {
            setAmount('');
            load();
          })
          .catch((err) => setError(err.message))
          .finally(() => setBusy(false));
      },
      onClose: () => {},
    });

    handler.openIframe();
  };

  return (
    <AppLayout title="Wallet">
      <PageTitle subtitle="Top up your balance and track wallet activity">Wallet</PageTitle>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isNarrow ? '1fr' : 'minmax(280px, 340px) 1fr',
          gap: isNarrow ? '16px' : '24px',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: radius.sm, background: colors.accentSoft ?? colors.panelAlt,
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <WalletIcon size={20} color={colors.accent} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: colors.textMuted, fontSize: '12px' }}>Current balance</div>
                <div style={{
                  fontFamily: font.display,
                  fontWeight: 700,
                  fontSize: isNarrow ? '22px' : '26px',
                  wordBreak: 'break-word',
                }}>
                  {balance === null ? '—' : `₦${Number(balance).toFixed(2)}`}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h2 style={{ fontFamily: font.display, fontSize: '15px', margin: '0 0 18px' }}>Top up</h2>
            <form onSubmit={(e) => { e.preventDefault(); handlePay(); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

              <ErrorText>{error}</ErrorText>

              <Button type="submit" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={15} /> Add funds
              </Button>
            </form>
          </Card>
        </div>

        <Card>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            flexWrap: 'wrap',
            gap: '6px',
          }}>
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 0',
                  borderBottom: `1px solid ${colors.border}`,
                  flexWrap: isNarrow ? 'wrap' : 'nowrap',
                }}
              >
                {tx.type === 'topup' ? (
                  <ArrowUpCircle size={20} color={colors.success ?? '#3fb950'} style={{ flexShrink: 0 }} />
                ) : (
                  <ArrowDownCircle size={20} color={colors.accent} style={{ flexShrink: 0 }} />
                )}
                <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {tx.type === 'topup' ? 'Top-up' : 'Deduction'}
                  </div>
                  <div style={{
                    color: colors.textMuted,
                    fontSize: '12px',
                    marginTop: '4px',
                    wordBreak: 'break-word',
                  }}>
                    {new Date(tx.createdAt).toLocaleString()} · {tx.method}
                  </div>
                </div>
                <div style={{
                  fontWeight: 700,
                  color: tx.type === 'topup' ? (colors.success ?? '#3fb950') : colors.accent,
                  marginLeft: isNarrow ? 'auto' : 0,
                  flexShrink: 0,
                }}>
                  {tx.type === 'topup' ? '+' : '-'}₦{Number(tx.amount).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </AppLayout>
  );
}