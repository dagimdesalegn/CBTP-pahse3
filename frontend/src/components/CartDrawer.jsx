import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { Button, EmptyState, ProductImage } from './ui'
import { formatBirr } from '../utils/currency'

export default function CartDrawer({ open, cart, cartTotal, onClose, onRemove, onCheckout, onUpdateQuantity, fulfillmentType = 'pickup', deliveryAddress = '', onFulfillmentChange, onDeliveryAddressChange }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-slate-950/55" onClick={onClose} aria-label="Close cart" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Checkout</p>
            <h2 className="text-xl font-black">Shopping Cart</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10" aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={ShoppingCart}
              title="Your cart is empty"
              description="Add products from the marketplace to start a new order."
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
                          <h3 className="truncate text-sm font-bold text-slate-950">{item.product.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">{formatBirr(item.product.effective_price ?? item.product.discount_price ?? item.product.price)} each</p>
                        </div>
                        <button onClick={() => onRemove(item.product_id)} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove item">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-lg border border-slate-300">
                          <button
                            onClick={() => onUpdateQuantity?.(item.product_id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-1.5 text-slate-600 hover:bg-slate-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-9 border-x border-slate-300 px-3 py-1.5 text-center text-sm font-bold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity?.(item.product_id, Math.min(Number(item.product.quantity), item.quantity + 1))}
                            className="px-2 py-1.5 text-slate-600 hover:bg-slate-50"
                            aria-label="Increase quantity"
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
                  <span className="ui-label">Fulfillment</span>
                  <select value={fulfillmentType} onChange={(e) => onFulfillmentChange?.(e.target.value)} className="ui-input">
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </label>
                {fulfillmentType === 'delivery' && (
                  <label>
                    <span className="ui-label">Delivery Address</span>
                    <input value={deliveryAddress} onChange={(e) => onDeliveryAddressChange?.(e.target.value)} placeholder="Enter delivery location" className="ui-input" />
                  </label>
                )}
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-bold text-slate-700">Subtotal</span>
                <span className="text-2xl font-black text-slate-950">{formatBirr(cartTotal)}</span>
              </div>
              <Button onClick={onCheckout} className="w-full">
                Place Order
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
