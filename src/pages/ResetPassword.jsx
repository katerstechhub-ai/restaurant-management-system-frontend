import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { colors, font } from '../styles/tokens';
import { Card, Button, Input, ErrorText } from '../components/ui';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await resetPassword({ token, password });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.body }}>
      <Card style={{ width: '380px' }}>
        <h1 style={{ fontFamily: font.display, fontSize: '24px', marginBottom: '4px', color: colors.textPrimary }}>Set a new password</h1>
        <p style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '24px' }}>Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save new password'}</Button>
        </form>

        <div style={{ marginTop: '16px', fontSize: '13px' }}>
          <Link to="/login" style={{ color: colors.accent }}>Back to log in</Link>
        </div>
      </Card>
    </div>
  );
}
