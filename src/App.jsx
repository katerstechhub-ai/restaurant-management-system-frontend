import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Landing from './pages/Landing';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Menu from './pages/Menu';
import MenuAdmin from './pages/MenuAdmin';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import TransactionHistory from './pages/TransactionHistory';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Reservations from './pages/Reservations';
import FloorPlan from './pages/FloorPlan';
import KitchenDashboard from './pages/KitchenDashboard';
import Inventory from './pages/Inventory';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
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

            <Route path="*" element={<Navigate to="/menu" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}