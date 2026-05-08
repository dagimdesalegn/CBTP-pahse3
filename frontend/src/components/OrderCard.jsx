import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

const stageHints = {
  pending: 'Waiting for store review',
  approved: 'Approved and scheduled',
  ready: 'Ready for pickup',
  completed: 'Delivered to member',
  cancelled: 'Order cancelled',
}

export default function OrderCard({ order }) {
  const orderDate = new Date(order.created_at).toLocaleDateString()
  const items = order.orderItems || order.order_items || []
  const productNames = items.map(item => item.product?.name).filter(Boolean)

  return (
    <Link to={`/member/orders/${order.id}`}>
      <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Order #{order.id}</h3>
            <p className="mt-1 text-sm text-slate-500">{orderDate}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mb-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {stageHints[order.status] || 'Processing your request'}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">Items: {items.length || 0}</p>
            <p className="text-sm font-semibold text-slate-900">Total: ${Number(order.total_price).toFixed(2)}</p>
          </div>
          <div className="max-w-[60%] text-right text-sm text-slate-500">
            {productNames.length > 0 ? productNames.join(', ') : 'Tap to view details'}
          </div>
        </div>
      </div>
    </Link>
  )
}
