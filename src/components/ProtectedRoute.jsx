import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/tokens';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ background: colors.bg, color: colors.textMuted, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.indexOf(user.role) === -1) {
    return <Navigate to="/menu" replace />;
  }

  return children;
}
