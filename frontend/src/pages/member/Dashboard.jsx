import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import ProductCard from '../../components/ProductCard'
import Toast from '../../components/Toast'
import { ShoppingCart } from 'lucide-react'

export default function MemberDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState(null)
  const [showCartModal, setShowCartModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes, notificationsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products?page=1'),
        api.get('/notifications'),
      ])

      const orders = ordersRes.data.data || ordersRes.data || []
      const products = productsRes.data.data || productsRes.data || []
      setProducts(Array.isArray(products) ? products : [])
      const notifications = notificationsRes.data.data || notificationsRes.data || []

      const totalOrders = (Array.isArray(orders) ? orders : []).length
      const totalSpent = (Array.isArray(orders) ? orders : []).reduce(
        (sum, o) => sum + Number(o.total_price || 0),
        0
      )
      const pendingOrders = (Array.isArray(orders) ? orders : []).filter(o => o.status === 'pending').length
      const unreadNotifications = (Array.isArray(notifications) ? notifications : []).filter(n => !n.is_read).length
      const availableProducts = (Array.isArray(products) ? products : []).length

      setStats({
        totalOrders,
        totalSpent,
        pendingOrders,
        unreadNotifications,
        availableProducts,
      })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setStats({
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        unreadNotifications: 0,
        availableProducts: 0,
      })
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    if (product.quantity === 0) {
      setToast({
        type: 'error',
        message: 'This product is out of stock',
      })
      return
    }

    const existing = cart.find(item => item.product_id === product.id)

    if (existing) {
      if (existing.quantity < product.quantity) {
        setCart(cart.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      } else {
        setToast({
          type: 'warning',
          message: 'Cannot add more of this product',
        })
      }
    } else {
      setCart([...cart, {
        product_id: product.id,
        quantity: 1,
        product: product,
      }])
    }

    setToast({
      type: 'success',
      message: `${product.name} added to cart`,
    })
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  const handleCheckout = async () => {
    if (!user?.is_verified) {
      setToast({
        type: 'error',
        message: 'Your account must be verified before placing orders',
      })
      return
    }

    try {
      await api.post('/orders', {
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      })

      setToast({
        type: 'success',
        message: 'Order placed successfully!',
      })
      setCart([])
      setShowCartModal(false)
      setTimeout(() => navigate('/member/orders'), 1500)
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.error || 'Failed to place order',
      })
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
              <button
                onClick={() => setShowCartModal(true)}
                className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-semibold"
              >
                <ShoppingCart size={18} />
                Cart ({cart.length})
              </button>
            </div>

            {!user?.is_verified && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">⚠️ Your account is pending verification.</p>
                  <p className="text-sm">
                    {user?.verification_submitted_at
                      ? 'Verification submitted. Please wait for approval.'
                      : 'Submit your kebele ID, coupon ID, and ID image to get verified.'}
                  </p>
                </div>
                {!user?.verification_submitted_at && (
                  <Link
                    to="/profile"
                    className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    Submit Verification
                  </Link>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard title="Total Orders" value={stats?.totalOrders || 0} color="blue" />
              <StatCard title="Total Spent" value={`$${Number(stats?.totalSpent || 0).toFixed(2)}`} color="green" />
              <StatCard title="Pending Orders" value={stats?.pendingOrders || 0} color="yellow" />
              <StatCard title="Available Products" value={stats?.availableProducts || 0} color="purple" />
              <StatCard title="Unread Notifications" value={stats?.unreadNotifications || 0} color="red" />
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Available Products</h2>
                <Link to="/member/products" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View all
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-slate-200">
                  <p className="text-gray-600">No products available right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      disabledReason={!user?.is_verified ? 'Please complete your verification process.' : ''}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showCartModal && (
        <CartModal
          cart={cart}
          cartTotal={cartTotal}
          onClose={() => setShowCartModal(false)}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
        />
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}

function StatCard({ title, value, color }) {
  const colorStyles = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
    red: 'bg-red-50 border-red-200',
  }

  return (
    <div className={`${colorStyles[color]} border rounded-lg p-6`}>
      <p className="text-gray-600 text-sm mb-2">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function CartModal({ cart, cartTotal, onClose, onRemove, onCheckout }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Shopping Cart</h2>
          <button onClick={onClose} className="text-2xl font-bold">×</button>
        </div>

        {cart.length === 0 ? (
          <div className="p-4 text-center text-gray-600">Your cart is empty</div>
        ) : (
          <>
            <div className="p-4 space-y-3">
              {cart.map(item => (
                <div key={item.product_id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-gray-600">${item.product.price} × {item.quantity}</p>
                  </div>
                  <button
                    onClick={() => onRemove(item.product_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">${cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-bold"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
