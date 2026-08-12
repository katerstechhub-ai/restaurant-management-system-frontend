import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../src/api/auth';
import { colors, font } from '../styles/tokens';
import { Card, Button, Input, ErrorText } from '../components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.body }}>
      <Card style={{ width: '380px' }}>
        <h1 style={{ fontFamily: font.display, fontSize: '24px', marginBottom: '4px', color: colors.textPrimary }}>Reset password</h1>
        <p style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '24px' }}>
          {sent ? 'Check your email for a reset link.' : "We'll email you a link to reset your password."}
        </p>

        {!sent && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <ErrorText>{error}</ErrorText>
            <Button type="submit" disabled={busy}>{busy ? 'Sending...' : 'Send reset link'}</Button>
          </form>
        )}

        <div style={{ marginTop: '16px', fontSize: '13px' }}>
          <Link to="/login" style={{ color: colors.accent }}>Back to log in</Link>
        </div>
      </Card>
    </div>
  );
}
