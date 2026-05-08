export default function OrderDetailModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null

  const items = Array.isArray(order.orderItems)
    ? order.orderItems
    : Array.isArray(order.order_items)
      ? order.order_items
      : []

  const statusColors = {
    pending: 'bg-gray-100 text-gray-700',
    approved: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const statusIcons = {
    pending: '📋',
    approved: '✅',
    ready: '📦',
    completed: '✓',
    cancelled: '❌',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-start border-b-4 border-blue-700">
          <div>
            <h2 className="text-3xl font-bold">Order #{order.id}</h2>
            <p className="text-blue-100 text-sm mt-1">{order.user?.name || 'Unknown Member'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:text-blue-200 transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Order Status */}
          <div className="mb-8 pb-8 border-b-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Order Status</h3>
            <div className={`inline-block px-4 py-2 rounded-full font-bold text-lg ${statusColors[order.status]}`}>
              {statusIcons[order.status]} {order.status.toUpperCase()}
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8 pb-8 border-b-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📦 Products ({items.length})</h3>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <div>
                    <p className="font-semibold text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity}x @ ${Number(item.unit_price || 0).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold text-lg text-blue-600">
                    ${(Number(item.quantity || 0) * Number(item.unit_price || 0)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="mb-8 pb-8 border-b-2 border-gray-200">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
              <p className="text-lg font-bold text-gray-800">Total Amount:</p>
              <p className="text-3xl font-bold text-blue-600">${Number(order.total_price || 0).toFixed(2)}</p>
            </div>
          </div>

          {/* Member Information */}
          <div className="mb-8 pb-8 border-b-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">👤 Member Information</h3>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <p className="text-gray-700 font-semibold">Name:</p>
                <p className="text-gray-900 font-medium">{order.user?.name}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-700 font-semibold">Email:</p>
                <p className="text-gray-900 font-medium">{order.user?.email}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-700 font-semibold">Phone:</p>
                <p className="text-gray-900 font-medium">{order.user?.phone}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-700 font-semibold">Verification Status:</p>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${order.user?.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {order.user?.is_verified ? '✓ Verified' : '⏳ Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📝 Special Notes</h3>
              <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <p className="text-gray-700">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Order Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold text-gray-800">Placed:</span> {new Date(order.created_at).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold text-gray-800">Last Updated:</span> {new Date(order.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Close Button */}
        <div className="sticky bottom-0 bg-gray-100 p-6 border-t-2 border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
