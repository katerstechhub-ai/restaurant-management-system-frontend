import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors, font } from '../styles/tokens';
import { Card, Button, Input, ErrorText } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/menu');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.body }}>
      <Card style={{ width: '380px' }}>
        <h1 style={{ fontFamily: font.display, fontSize: '24px', marginBottom: '4px', color: colors.textPrimary }}>Welcome back</h1>
        <p style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '24px' }}>Log in to your account</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</Button>
        </form>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <Link to="/forgot-password" style={{ color: colors.textMuted }}>Forgot password?</Link>
          <Link to="/register" style={{ color: colors.accent }}>Create account</Link>
        </div>
      </Card>
    </div>
  );
}
