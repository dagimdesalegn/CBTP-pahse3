import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'

export default function OrderCard({ order }) {
  const orderDate = new Date(order.created_at).toLocaleDateString()

  return (
    <Link to={`/member/orders/${order.id}`}>
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
          <StatusBadge status={order.status} />
        </div>

        <p className="text-sm text-gray-600 mb-2">{orderDate}</p>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-600 mb-1">Items: {order.orderItems?.length || 0}</p>
            <p className="text-sm text-gray-600">Total: ${order.total_price}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            {order.orderItems?.map(item => item.product?.name).join(', ')}
          </div>
        </div>
      </div>
    </Link>
  )
}
