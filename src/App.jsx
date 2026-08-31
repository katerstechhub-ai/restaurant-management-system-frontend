import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { colors } from './styles/tokens';

// Every page is its own chunk now instead of one bundle carrying the whole
// app (auth pages + every admin dashboard + charts) upfront. Landing/Login
// still load fast since their chunks are tiny; heavier pages like
// Analytics (recharts) only load when someone actually visits /analytics.
const Login = lazy(() => import('./pages/Login'));
const Landing = lazy(() => import('./pages/Landing'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Menu = lazy(() => import('./pages/Menu'));
const MenuAdmin = lazy(() => import('./pages/MenuAdmin'));
const PlaceOrder = lazy(() => import('./pages/PlaceOrder'));
const Orders = lazy(() => import('./pages/Orders'));
const Checkout = lazy(() => import('./pages/Checkout'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Profile = lazy(() => import('./pages/Profile'));
const Reservations = lazy(() => import('./pages/Reservations'));
const FloorPlan = lazy(() => import('./pages/FloorPlan'));
const KitchenDashboard = lazy(() => import('./pages/KitchenDashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const CustomerProfileStaff = lazy(() => import('./pages/CustomerProfileStaff'));
const SupportTickets = lazy(() => import('./pages/SupportTickets'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Reports = lazy(() => import('./pages/Reports'));

function RouteFallback() {
  return (
    <div style={{ background: colors.bg, color: colors.textMuted, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route path="/menu" element={<Menu />} />
                <Route path="/menu-admin" element={<ProtectedRoute roles={['admin']}><MenuAdmin /></ProtectedRoute>} />
                <Route path="/order" element={<ProtectedRoute roles={['customer']}><PlaceOrder /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute roles={['admin', 'staff']}><Checkout /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute roles={['customer']}><Wallet /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/reservations" element={<ProtectedRoute roles={['customer']}><Reservations /></ProtectedRoute>} />
                <Route path="/floor-plan" element={<ProtectedRoute roles={['admin', 'staff']}><FloorPlan /></ProtectedRoute>} />
                <Route path="/kitchen" element={<ProtectedRoute roles={['admin', 'staff']}><KitchenDashboard /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute roles={['admin', 'staff']}><Inventory /></ProtectedRoute>} />
                <Route path="/customers" element={<ProtectedRoute roles={['admin', 'staff']}><CustomerProfileStaff /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute roles={['admin', 'staff']}><SupportTickets /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute roles={['admin', 'staff']}><Analytics /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute roles={['admin', 'staff']}><Reports /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/menu" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}