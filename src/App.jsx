import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Purchases from './pages/Purchases';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Categories from './pages/Categories';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import Receipts from './pages/Receipts';
import Users from './pages/Users';

// Components
import Layout from './components/Layout';

// Protected Route
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{ display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'center', background:'var(--bg-base)' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' }}>
          <div style={{
            width: '48px', height: '48px',
            border: '3px solid rgba(201,168,76,0.2)',
            borderTop: '3px solid #C9A84C',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'Tajawal, sans-serif' }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Public Route (redirect to dashboard if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display:'flex', minHeight:'100vh', alignItems:'center', justifyContent:'center', background:'var(--bg-base)' }}>
        <div style={{
          width: '44px', height: '44px',
          border: '3px solid rgba(201,168,76,0.2)',
          borderTop: '3px solid #C9A84C',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  fontFamily: 'Tajawal, sans-serif',
                  direction: 'rtl',
                  borderRadius: '14px',
                  border: '1px solid rgba(201,168,76,0.3)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                },
                success: {
                  iconTheme: { primary: '#22c55e', secondary: 'white' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: 'white' },
                },
              }}
            />

            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Admin Routes */}
                <Route path="/inventory" element={<ProtectedRoute adminOnly><Inventory /></ProtectedRoute>} />
                <Route path="/products"  element={<ProtectedRoute adminOnly><Products /></ProtectedRoute>} />
                <Route path="/purchases" element={<ProtectedRoute adminOnly><Purchases /></ProtectedRoute>} />
                <Route path="/orders"    element={<ProtectedRoute adminOnly><Orders /></ProtectedRoute>} />
                <Route path="/receipts"  element={<ProtectedRoute adminOnly><Receipts /></ProtectedRoute>} />
                <Route path="/users"     element={<ProtectedRoute adminOnly><Users /></ProtectedRoute>} />

                {/* Engineer Routes */}
                <Route path="/categories" element={<Categories />} />
                <Route path="/cart"       element={<Cart />} />
                <Route path="/my-orders"  element={<MyOrders />} />
              </Route>

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
