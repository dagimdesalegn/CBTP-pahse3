import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Boxes, Clock, CreditCard, Package, ShoppingCart } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import ProductCard from '../../components/ProductCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import CartDrawer from '../../components/CartDrawer'
import { Button, EmptyState, PageHeader, StatCard } from '../../components/ui'
import { formatBirr } from '../../utils/currency'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function MemberDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState(null)
  const [showCartModal, setShowCartModal] = useState(false)
  const [fulfillmentType, setFulfillmentType] = useState('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')
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
      const productList = productsRes.data.data || productsRes.data || []
      const notifications = notificationsRes.data.data || notificationsRes.data || []

      setProducts(Array.isArray(productList) ? productList.slice(0, 8) : [])
      setStats({
        totalOrders: (Array.isArray(orders) ? orders : []).length,
        totalSpent: (Array.isArray(orders) ? orders : []).reduce((sum, o) => sum + Number(o.total_price || 0), 0),
        pendingOrders: (Array.isArray(orders) ? orders : []).filter(o => o.status === 'pending').length,
        unreadNotifications: (Array.isArray(notifications) ? notifications : []).filter(n => !n.is_read).length,
        availableProducts: (Array.isArray(productList) ? productList : []).length,
      })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setStats({ totalOrders: 0, totalSpent: 0, pendingOrders: 0, unreadNotifications: 0, availableProducts: 0 })
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    if (product.quantity === 0) {
      setToast({ type: 'error', message: 'This product is out of stock' })
      return
    }

    const existing = cart.find(item => item.product_id === product.id)
    if (existing) {
      if (existing.quantity < product.quantity) {
        setCart(cart.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        setToast({ type: 'warning', message: 'Cannot add more of this product' })
        return
      }
    } else {
      setCart([...cart, { product_id: product.id, quantity: 1, product }])
    }
    setToast({ type: 'success', message: `${product.name} added to cart` })
  }

  const handleCheckout = async () => {
    if (!user?.is_verified) {
      setToast({ type: 'error', message: 'Your account must be verified before placing orders' })
      return
    }

    try {
      if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
        setToast({ type: 'error', message: 'Delivery address is required for delivery orders' })
        return
      }

      await api.post('/orders', {
        items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
        fulfillment_type: fulfillmentType,
        delivery_address: fulfillmentType === 'delivery' ? deliveryAddress.trim() : null,
      })
      setToast({ type: 'success', message: 'Order placed successfully!' })
      setCart([])
      setShowCartModal(false)
      setTimeout(() => navigate('/member/orders'), 1500)
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to place order' })
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.product.effective_price ?? item.product.discount_price ?? item.product.price) * item.quantity), 0)

  if (loading) return <LoadingSpinner />

  return (
    <AppLayout cartCount={cart.length} onCartClick={() => setShowCartModal(true)}>
      <PageHeader
        eyebrow="Member home"
        title={`Welcome back, ${user?.name || 'member'}`}
        description="Browse available products, track your order activity, and keep your verification ready for checkout."
        actions={
          <>
            <Button as={Link} to="/member/products" variant="secondary">
              <Package size={17} />
              Browse Products
            </Button>
            <Button onClick={() => setShowCartModal(true)}>
              <ShoppingCart size={17} />
              Cart ({cart.length})
            </Button>
          </>
        }
      />

      {!user?.is_verified && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-black text-amber-950">Verification required for checkout</h2>
              <p className="mt-1 text-sm text-amber-800">
                {user?.verification_submitted_at
                  ? 'Your verification was submitted and is waiting for admin approval.'
                  : 'Submit your kebele ID, coupon ID, and ID image before placing orders.'}
              </p>
            </div>
            {!user?.verification_submitted_at && (
              <Button as={Link} to="/profile" variant="dark">Submit Verification</Button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Orders" value={stats?.totalOrders || 0} icon={ShoppingCart} tone="sky" />
        <StatCard title="Total Spent" value={formatBirr(stats?.totalSpent)} icon={CreditCard} tone="emerald" />
        <StatCard title="Pending" value={stats?.pendingOrders || 0} icon={Clock} tone="amber" />
        <StatCard title="Products" value={stats?.availableProducts || 0} icon={Boxes} tone="violet" />
        <StatCard title="Unread" value={stats?.unreadNotifications || 0} icon={Bell} tone="rose" />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">Featured marketplace</h2>
            <p className="text-sm text-slate-600">Quick add popular available products to your pickup order.</p>
          </div>
          <Link to="/member/products" className="text-sm font-bold text-amber-700 hover:text-amber-800">View all</Link>
        </div>

        {products.length === 0 ? (
          <EmptyState title="No products available" description="The store catalog is empty right now." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
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
      </section>

      <CartDrawer
        open={showCartModal}
        cart={cart}
        cartTotal={cartTotal}
        onClose={() => setShowCartModal(false)}
        onRemove={(productId) => setCart(cart.filter(item => item.product_id !== productId))}
        onCheckout={handleCheckout}
        onUpdateQuantity={(productId, quantity) => setCart(cart.map(item => item.product_id === productId ? { ...item, quantity } : item))}
        fulfillmentType={fulfillmentType}
        deliveryAddress={deliveryAddress}
        onFulfillmentChange={setFulfillmentType}
        onDeliveryAddressChange={setDeliveryAddress}
      />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
