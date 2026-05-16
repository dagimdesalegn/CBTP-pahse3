import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Search, ShoppingCart } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import ProductCard from '../../components/ProductCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import CartDrawer from '../../components/CartDrawer'
import { Button, EmptyState, PageHeader } from '../../components/ui'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../context/LanguageContext'

export default function Products() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [toast, setToast] = useState(null)
  const [showCartModal, setShowCartModal] = useState(false)
  const [fulfillmentType, setFulfillmentType] = useState('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t, productName, categoryLabel } = useLanguage()

  useEffect(() => {
    fetchProducts()
  }, [search, category])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products?per_page=100')
      const items = response.data.data || []
      setCategories([...new Set(items.map(p => p.category))].filter(Boolean))
    } catch (err) {
      setCategories([])
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)

      const response = await api.get(`/products?${params}`)
      const items = response.data.data || []
      setProducts(items)
    } catch (err) {
      setToast({ type: 'error', message: t('products.fetchFailed') })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    if (product.quantity === 0) {
      setToast({ type: 'error', message: t('products.outOfStock') })
      return
    }

    const existing = cart.find(item => item.product_id === product.id)
    if (existing) {
      if (existing.quantity < product.quantity) {
        setCart(cart.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        setToast({ type: 'warning', message: t('products.maxStock') })
        return
      }
    } else {
      setCart([...cart, { product_id: product.id, quantity: 1, product }])
    }

    setToast({ type: 'success', message: t('products.addedToCart', { name: productName(product) }) })
  }

  const updateCartQuantity = (productId, quantity) => {
    setCart(cart.map(item => item.product_id === productId ? { ...item, quantity } : item))
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  const handleRemoveFromCart = (product) => {
    removeFromCart(product.id)
    setToast({ type: 'success', message: t('products.removedFromCart', { name: productName(product) }) })
  }

  const handleCheckout = async () => {
    if (!user?.is_verified) {
      setToast({ type: 'error', message: t('cart.verifiedRequired') })
      return
    }

    try {
      if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
        setToast({ type: 'error', message: t('cart.deliveryRequired') })
        return
      }

      await api.post('/orders', {
        items: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
        fulfillment_type: fulfillmentType,
        delivery_address: fulfillmentType === 'delivery' ? deliveryAddress.trim() : null,
      })
      setToast({ type: 'success', message: t('cart.orderSuccess') })
      setCart([])
      setShowCartModal(false)
      setTimeout(() => navigate('/member/orders'), 1500)
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || t('cart.orderFailed') })
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.product.effective_price ?? item.product.discount_price ?? item.product.price) * item.quantity), 0)
  const featuredCategories = useMemo(() => ['All', ...categories], [categories])

  return (
    <AppLayout cartCount={cart.length} onCartClick={() => setShowCartModal(true)}>
      <PageHeader
        eyebrow={t('products.marketEyebrow')}
        title={t('products.title')}
        description={t('products.description')}
        actions={
          <Button onClick={() => setShowCartModal(true)} variant="dark">
            <ShoppingCart size={17} />
            {t('nav.cart')} ({cart.length})
          </Button>
        }
      />

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2 sm:gap-3 lg:grid-cols-[1fr_260px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={t('products.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ui-input pl-10"
            />
          </label>
          <label className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="ui-input pl-10">
              <option value="">{t('products.allCategories')}</option>
              {categories.map(cat => <option key={cat} value={cat}>{categoryLabel(cat)}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-4">
          {featuredCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat === 'All' ? '' : cat)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
                (cat === 'All' && !category) || category === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? t('products.all') : categoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState title={t('products.noProducts')} description={t('products.noProductsDesc')} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              cartQuantity={cart.find(item => item.product_id === product.id)?.quantity || 0}
              disabledReason={!user?.is_verified ? t('products.verifyBeforeBuying') : ''}
            />
          ))}
        </div>
      )}

      <CartDrawer
        open={showCartModal}
        cart={cart}
        cartTotal={cartTotal}
        onClose={() => setShowCartModal(false)}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        onUpdateQuantity={updateCartQuantity}
        fulfillmentType={fulfillmentType}
        deliveryAddress={deliveryAddress}
        onFulfillmentChange={setFulfillmentType}
        onDeliveryAddressChange={setDeliveryAddress}
      />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
