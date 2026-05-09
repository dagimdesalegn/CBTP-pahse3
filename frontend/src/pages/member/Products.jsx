import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import ProductCard from '../../components/ProductCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { ShoppingCart } from 'lucide-react'

export default function Products() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [toast, setToast] = useState(null)
  const [showCartModal, setShowCartModal] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [search, category])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)

      const response = await api.get(`/products?${params}`)
      const items = response.data.data || []
      setProducts(items)

      const uniqueCategories = [...new Set(items.map(p => p.category))].filter(Boolean)
      setCategories(uniqueCategories)
    } catch (err) {
      setToast({
        type: 'error',
        message: 'Failed to fetch products',
      })
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
      const response = await api.post('/orders', {
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
      setTimeout(() => navigate('/member/orders'), 2000)
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
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <button
                onClick={() => setShowCartModal(true)}
                className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-semibold"
              >
                <ShoppingCart size={20} />
                Cart ({cart.length})
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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

function CartModal({ cart, cartTotal, onClose, onRemove, onCheckout }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-primary text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
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
                <span className="text-2xl font-bold text-primary">${cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700 font-bold"
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
