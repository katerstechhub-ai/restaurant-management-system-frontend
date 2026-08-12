import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors, font } from '../styles/tokens';
import { Card, Button, Input, ErrorText } from '../components/ui';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(name, email, password);
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
        <h1 style={{ fontFamily: font.display, fontSize: '24px', marginBottom: '4px', color: colors.textPrimary }}>Create account</h1>
        <p style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '24px' }}>Sign up to start ordering</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <ErrorText>{error}</ErrorText>
          <Button type="submit" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</Button>
        </form>

        <div style={{ marginTop: '16px', fontSize: '13px' }}>
          <span style={{ color: colors.textMuted }}>Already have an account? </span>
          <Link to="/login" style={{ color: colors.accent }}>Log in</Link>
        </div>
      </Card>
    </div>
  );
}
