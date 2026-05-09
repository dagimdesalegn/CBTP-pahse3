import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, PackageCheck } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatBirr } from '../utils/currency'

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
    <Link to={`/member/orders/${order.id}`} className="block">
      <article className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Order #{order.id}</p>
            <h3 className="mt-1 text-lg font-black text-slate-950">{stageHints[order.status] || 'Processing your request'}</h3>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={16} />
            {orderDate}
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <PackageCheck size={16} />
            {items.length || 0} items
          </div>
        </div>

        <p className="mt-4 line-clamp-1 text-sm text-slate-500">
          {productNames.length > 0 ? productNames.join(', ') : 'Open order for product details'}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-xl font-black text-slate-950">{formatBirr(order.total_price)}</p>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-700">
            Details <ChevronRight className="transition group-hover:translate-x-0.5" size={16} />
          </span>
        </div>
      </article>
    </Link>
  )
}
