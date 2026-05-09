import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Truck } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import { Button, ProductImage, StockBadge } from '../../components/ui'
import { formatBirr } from '../../utils/currency'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t, productName, productDescription, categoryLabel } = useLanguage()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/products/${id}`)
      setProduct(response.data)
    } catch (err) {
      setToast({ type: 'error', message: t('products.loadFailed') })
    } finally {
      setLoading(false)
    }
  }

  const orderSingleProduct = async () => {
    if (!user?.is_verified) {
      setToast({ type: 'error', message: t('products.verifyBeforeBuying') })
      return
    }
    if (Number(product.quantity) <= 0) {
      setToast({ type: 'error', message: t('products.outOfStock') })
      return
    }
    try {
      await api.post('/orders', {
        items: [{ product_id: product.id, quantity: 1 }],
        fulfillment_type: 'pickup',
        delivery_address: null,
      })
      setToast({ type: 'success', message: t('cart.orderSuccess') })
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || err.response?.data?.message || t('cart.orderFailed') })
    }
  }

  if (loading) return <LoadingSpinner />

  if (!product) {
    return (
      <AppLayout>
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-black text-slate-950">{t('products.productNotFound')}</h1>
          <Button as={Link} to="/member/products" className="mt-4">{t('products.backToProducts')}</Button>
        </div>
      </AppLayout>
    )
  }

  const effectivePrice = Number(product.effective_price ?? product.discount_price ?? product.price)
  const hasDiscount = product.discount_price && Number(product.discount_price) < Number(product.price)

  return (
    <AppLayout>
      <div className="mb-4">
        <Button as={Link} to="/member/products" variant="secondary">
          <ArrowLeft size={16} />
          {t('nav.products')}
        </Button>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <ProductImage product={product} className="h-72 sm:h-[420px] lg:h-full" />
          <div className="flex flex-col p-5 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">{categoryLabel(product.category) || t('common.product')}</p>
              <StockBadge quantity={product.quantity} />
            </div>

            <h1 className="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-4xl">{productName(product)}</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">{productDescription(product) || t('products.qualityFallback')}</p>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('products.memberPrice')}</p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <p className="text-3xl font-black text-slate-950">{formatBirr(effectivePrice)}</p>
                {hasDiscount && <p className="pb-1 text-sm font-bold text-slate-400 line-through">{formatBirr(product.price)}</p>}
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-600">{product.quantity} {t('products.availableInStock')}</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button onClick={orderSingleProduct} disabled={!user?.is_verified || Number(product.quantity) <= 0} className="py-3">
                <ShoppingCart size={18} />
                {Number(product.quantity) <= 0 ? t('products.unavailable') : user?.is_verified ? t('products.orderOne') : t('products.verifyToBuy')}
              </Button>
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                <Truck size={18} className="text-amber-700" />
                {t('products.pickupDelivery')}
              </div>
            </div>

            {!user?.is_verified && (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-800">
                {t('products.verifyBeforeOrders')}
              </p>
            )}
          </div>
        </div>
      </section>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
