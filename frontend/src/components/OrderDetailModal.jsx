import { Calendar, Package, User, X } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatBirr } from '../utils/currency'

export default function OrderDetailModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null

  const items = Array.isArray(order.orderItems)
    ? order.orderItems
    : Array.isArray(order.order_items)
      ? order.order_items
      : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/55"
        onClick={onClose}
      ></div>

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between bg-slate-900 p-6 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Order details</p>
            <h2 className="mt-1 text-3xl font-black">Order #{order.id}</h2>
            <p className="mt-1 text-sm text-slate-300">{order.user?.name || 'Unknown Member'}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 border-b border-slate-200 pb-6">
            <h3 className="mb-3 text-lg font-black text-slate-950">Order Status</h3>
            <StatusBadge status={order.status} />
          </div>

          <div className="mb-6 border-b border-slate-200 pb-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Package size={19} /> Products ({items.length})</h3>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-bold text-slate-950">{item.product?.name || 'Unknown Product'}</p>
                    <p className="text-sm text-slate-600">
                      {item.quantity}x @ {formatBirr(item.unit_price)}
                    </p>
                  </div>
                  <p className="text-lg font-black text-slate-950">
                    {formatBirr(Number(item.quantity || 0) * Number(item.unit_price || 0))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 border-b border-slate-200 pb-6">
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-lg font-bold text-slate-800">Total Amount</p>
              <p className="text-3xl font-black text-slate-950">{formatBirr(order.total_price)}</p>
            </div>
          </div>

          <div className="mb-6 border-b border-slate-200 pb-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><User size={19} /> Member Information</h3>
            <div className="space-y-3 rounded-lg bg-slate-50 p-4">
              <div className="flex justify-between">
                <p className="font-semibold text-slate-700">Name:</p>
                <p className="font-medium text-slate-900">{order.user?.name}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold text-slate-700">Email:</p>
                <p className="font-medium text-slate-900">{order.user?.email}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold text-slate-700">Phone:</p>
                <p className="font-medium text-slate-900">{order.user?.phone}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold text-slate-700">Verification Status:</p>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${order.user?.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {order.user?.is_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-black text-slate-950">Special Notes</h3>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-slate-700">{order.notes}</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Calendar size={19} /> Order Information</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">Fulfillment:</span> {(order.fulfillment_type || 'pickup').charAt(0).toUpperCase() + (order.fulfillment_type || 'pickup').slice(1)}
              </p>
              {order.delivery_address && (
                <p>
                  <span className="font-semibold text-slate-800">Delivery Address:</span> {order.delivery_address}
                </p>
              )}
              <p>
                <span className="font-semibold text-slate-800">Payment:</span> {order.payment?.status || 'unpaid'}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Placed:</span> {new Date(order.created_at).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Last Updated:</span> {new Date(order.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50 p-5">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-slate-900 py-3 font-bold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
