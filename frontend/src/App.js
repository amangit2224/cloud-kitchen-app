import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import Favorites from './pages/Favorites';
import RiderRegister from './pages/RiderRegister';
import RiderDashboard from './pages/RiderDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageOrders from './pages/admin/ManageOrders';
import ManageMenu from './pages/admin/ManageMenu';
import ManageRiders from './pages/admin/ManageRiders';
import Profile from './pages/Profile';  // 👈 ADD THIS

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/menu" element={<Menu />} />
                
                {/* Protected Customer Routes */}
                {/* Note: /cart route removed - using drawer cart from Navbar */}
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <OrderHistory />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Order Details Route */}
                <Route 
                  path="/orders/:id" 
                  element={
                    <ProtectedRoute>
                      <OrderDetails />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Favorites Route */}
                <Route 
                  path="/favorites" 
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  } 
                />

                {/* Profile Route */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Rider Routes */}
                <Route path="/rider/register" element={<RiderRegister />} />
                <Route 
                  path="/rider/dashboard" 
                  element={
                    <ProtectedRoute>
                      <RiderDashboard />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/orders" 
                  element={
                    <ProtectedRoute>
                      <ManageOrders />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/menu" 
                  element={
                    <ProtectedRoute>
                      <ManageMenu />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/riders" 
                  element={
                    <ProtectedRoute>
                      <ManageRiders />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;