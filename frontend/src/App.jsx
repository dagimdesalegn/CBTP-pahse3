import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, AuthContext } from './context/AuthContext'
import { useContext, useEffect, useState } from 'react'
import { useTelegram } from './hooks/useTelegram'
import api from './services/api'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import MemberDashboard from './pages/member/Dashboard'
import MemberProducts from './pages/member/Products'
import MemberOrders from './pages/member/Orders'
import OrderDetail from './pages/member/OrderDetail'
import Profile from './pages/member/Profile'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import ProductManagement from './pages/manager/ProductManagement'
import OrderManagement from './pages/manager/OrderManagement'
import InventoryManagement from './pages/manager/InventoryManagement'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import Reports from './pages/admin/Reports'
import AdminOrders from './pages/admin/OrderManagement'
import AdminNotifications from './pages/admin/AdminNotifications'

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useContext(AuthContext)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function RoleBasedDashboard() {
  const { user } = useContext(AuthContext)

  if (!user) return <Navigate to="/login" replace />

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'manager') return <Navigate to="/manager/dashboard" replace />
  return <Navigate to="/member/dashboard" replace />
}

function AppRoutes() {
  const { user } = useContext(AuthContext)
  const { isTelegramApp  } = useTelegram()

  useEffect(() => {
    if (user?.telegram_id) {
      // Auto-link Telegram if available
      window.telegram = { linkedUserId: user.id }
    }
  }, [user])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard router - redirects based on role */}
      <Route path="/dashboard" element={<RoleBasedDashboard />} />

      {/* Member Routes */}
      <Route
        path="/member/dashboard"
        element={
          <ProtectedRoute requiredRole="member">
            <MemberDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/products"
        element={
          <ProtectedRoute requiredRole="member">
            <MemberProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/orders"
        element={
          <ProtectedRoute requiredRole="member">
            <MemberOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/orders/:id"
        element={
          <ProtectedRoute requiredRole="member">
            <OrderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Manager Routes */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute requiredRole="manager">
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/products"
        element={
          <ProtectedRoute requiredRole="manager">
            <ProductManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/orders"
        element={
          <ProtectedRoute requiredRole="manager">
            <OrderManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/inventory"
        element={
          <ProtectedRoute requiredRole="manager">
            <InventoryManagement />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requiredRole="admin">
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminNotifications />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
