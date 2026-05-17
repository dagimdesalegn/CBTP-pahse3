import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Button, EmptyState, ProductImage } from './ui'
import { formatBirr } from '../utils/currency'
import { useLanguage } from '../context/LanguageContext'

export default function CartDrawer({ open, cart, cartTotal, onClose, onRemove, onCheckout, onUpdateQuantity, fulfillmentType = 'pickup', deliveryAddress = '', onFulfillmentChange, onDeliveryAddressChange, paymentMethod = 'chapa', onPaymentMethodChange, walletBalance = 0 }) {
  const { t, productName } = useLanguage()
  const drawerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    drawerRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-slate-950/55" onClick={onClose} aria-label={t('common.close')} />
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl focus:outline-none"
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">{t('cart.checkout')}</p>
            <h2 id="cart-drawer-title" className="text-xl font-black">{t('cart.shoppingCart')}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10" aria-label={t('common.close')}>
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={ShoppingCart}
              title={t('cart.emptyTitle')}
              description={t('cart.emptyDesc')}
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.product_id} className="grid grid-cols-[72px_1fr] gap-3 rounded-lg border border-slate-200 p-3">
                    <ProductImage product={item.product} className="h-20 rounded-md" />
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="truncate text-sm font-bold text-slate-950">{productName(item.product)}</h3>
                          <p className="mt-1 text-sm text-slate-500">{formatBirr(item.product.effective_price ?? item.product.discount_price ?? item.product.price)} {t('cart.each')}</p>
                        </div>
                        <button onClick={() => onRemove(item.product_id)} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={t('cart.remove')}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-lg border border-slate-300">
                          <button
                            onClick={() => onUpdateQuantity?.(item.product_id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-1.5 text-slate-600 hover:bg-slate-50"
                            aria-label={t('cart.decrease')}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-9 border-x border-slate-300 px-3 py-1.5 text-center text-sm font-bold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity?.(item.product_id, Math.min(Number(item.product.quantity), item.quantity + 1))}
                            className="px-2 py-1.5 text-slate-600 hover:bg-slate-50"
                            aria-label={t('cart.increase')}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-base font-black text-slate-950">{formatBirr(Number(item.product.effective_price ?? item.product.discount_price ?? item.product.price) * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 p-5">
              <div className="mb-4 space-y-3">
                <label>
                  <span className="ui-label">{t('cart.fulfillment')}</span>
                  <select value={fulfillmentType} onChange={(e) => onFulfillmentChange?.(e.target.value)} className="ui-input">
                    <option value="pickup">{t('cart.pickup')}</option>
                    <option value="delivery">{t('cart.delivery')}</option>
                  </select>
                </label>
                {fulfillmentType === 'delivery' && (
                  <label>
                    <span className="ui-label">{t('cart.deliveryAddress')}</span>
                    <input value={deliveryAddress} onChange={(e) => onDeliveryAddressChange?.(e.target.value)} placeholder={t('cart.deliveryPlaceholder')} className="ui-input" />
                  </label>
                )}
                <div>
                  <span className="ui-label">Payment method</span>
                  <div className="grid gap-2">
                    {[
                      { value: 'wallet', title: 'Pay with wallet', description: `Use your wallet balance (${formatBirr(walletBalance)})` },
                      { value: 'chapa', title: 'Pay with Chapa', description: 'Pay online with Chapa checkout' },
                      { value: 'in_person', title: 'Pay in person', description: 'Pay cash during pickup or delivery' },
                    ].map(option => (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                          paymentMethod === option.value ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={option.value}
                          checked={paymentMethod === option.value}
                          onChange={() => onPaymentMethodChange?.(option.value)}
                          className="mt-1"
                        />
                        <span>
                          <span className="block text-sm font-black text-slate-950">{option.title}</span>
                          <span className="block text-xs font-semibold leading-5 text-slate-600">{option.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-bold text-slate-700">{t('cart.subtotal')}</span>
                <span className="text-2xl font-black text-slate-950">{formatBirr(cartTotal)}</span>
              </div>
              <Button onClick={onCheckout} className="w-full">
                {paymentMethod === 'chapa' ? 'Continue to payment' : t('cart.placeOrder')}
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
