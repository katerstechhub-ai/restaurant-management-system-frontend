import { useEffect, useState } from 'react';
import { UserCog, UserPlus } from 'lucide-react';
import { getAllUsers, createUser, updateUserRole } from '../api/users';
import { colors, radius, font } from '../styles/tokens';
import AdminLayout from '../components/AdminLayout';
import { Card, Select, Input, Button, PageTitle, ErrorText, StatusPill } from '../components/ui';

const ROLES = ['admin', 'waiter', 'kitchen', 'customer'];

const ROLE_COLORS = {
  admin: '#E84A3B',
  waiter: '#4caf50',
  kitchen: '#FFA800',
  customer: colors.textMuted,
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('waiter');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    getAllUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await createUser({ name, email, password, role });
      setName('');
      setEmail('');
      setPassword('');
      setRole('waiter');
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    setError('');
    try {
      await updateUserRole(id, newRole);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AdminLayout title="Users">
      <PageTitle
        subtitle={`${users.length} accounts`}
        action={
          <Button onClick={() => setFormOpen((v) => !v)}>
            <UserPlus size={15} />
            {formOpen ? 'Cancel' : 'New User'}
          </Button>
        }
      >
        Users
      </PageTitle>

      {formOpen && (
        <Card style={{ marginBottom: '20px' }}>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
            <div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </form>
          <ErrorText>{formError}</ErrorText>
        </Card>
      )}

      <ErrorText>{error}</ErrorText>

      {loading ? (
        <p style={{ color: colors.textMuted }}>Loading users…</p>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: colors.panelAlt, borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ padding: '16px', color: colors.textMuted, fontWeight: 600 }}>Name</th>
                <th style={{ padding: '16px', color: colors.textMuted, fontWeight: 600 }}>Email</th>
                <th style={{ padding: '16px', color: colors.textMuted, fontWeight: 600 }}>Role</th>
                <th style={{ padding: '16px', color: colors.textMuted, fontWeight: 600 }}>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id} style={{ borderBottom: i === users.length - 1 ? 'none' : `1px solid ${colors.border}` }}>
                  <td style={{ padding: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UserCog size={16} color={colors.textMuted} />
                    {u.name}
                  </td>
                  <td style={{ padding: '16px', color: colors.textMuted }}>{u.email}</td>
                  <td style={{ padding: '16px' }}>
                    <StatusPill status={u.role} color={ROLE_COLORS[u.role] || colors.textMuted} />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      style={{
                        background: 'rgba(20,20,20,0.8)', border: `1px solid ${colors.border}`, color: colors.text,
                        padding: '8px 12px', borderRadius: radius.sm, fontFamily: font.body, fontSize: '13px', outline: 'none',
                      }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: colors.textMuted }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </AdminLayout>
  );
}