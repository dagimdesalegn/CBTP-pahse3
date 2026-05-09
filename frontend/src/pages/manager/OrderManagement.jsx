import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import OrderDetailModal from '../../components/OrderDetailModal'
import api from '../../services/api'

const STAGES = [
  { status: 'pending', label: 'Requested', icon: '📋', color: 'bg-gray-100 text-gray-700' },
  { status: 'approved', label: 'Approved', icon: '✅', color: 'bg-yellow-100 text-yellow-700' },
  { status: 'ready', label: 'Ready', icon: '📦', color: 'bg-blue-100 text-blue-700' },
  { status: 'completed', label: 'Completed', icon: '✓', color: 'bg-green-100 text-green-700' },
]

export default function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [toast, setToast] = useState(null)
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter) params.append('status', filter)

      const response = await api.get(`/orders?${params}`)
      setOrders(response.data.data || [])
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch orders' })
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      setToast({ type: 'success', message: `Order status updated to ${newStatus}` })
      fetchOrders()
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update order' })
    }
  }

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`)
      setSelectedOrder(response.data)
      setIsDetailModalOpen(true)
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to load order details' })
    }
  }

  if (loading) return <LoadingSpinner />

  const statuses = ['pending', 'approved', 'ready', 'completed', 'cancelled']

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Orders</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Mobile View - Card Layout */}
            <div className="md:hidden space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                        <div className="flex items-center gap-2 text-blue-100 text-sm">
                          {order.user?.avatar_url ? (
                            <img
                              src={order.user.avatar_url}
                              alt={order.user?.name || 'Member'}
                              className="w-7 h-7 rounded-full object-cover border border-white/50"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center text-xs font-semibold">
                              {order.user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <span>{order.user?.name}</span>
                        </div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="text-2xl font-bold">${order.total_price}</div>
                  </div>

                  <button
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-t-2 border-gray-100 font-semibold text-blue-600 transition-colors"
                  >
                    {expandedOrderId === order.id ? 'Hide Options ▲' : 'Show Options ▼'}
                  </button>

                  <button
                    onClick={() => viewOrderDetails(order.id)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 border-t border-gray-100 font-semibold text-indigo-600 transition-colors"
                  >
                    👁️ View Full Details
                  </button>

                  {expandedOrderId === order.id && (
                    <div className="px-4 py-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Update Status</p>
                      <div className="grid grid-cols-2 gap-2">
                        {STAGES.map(stage => (
                          <button
                            key={stage.status}
                            onClick={() => updateOrderStatus(order.id, stage.status)}
                            disabled={order.status === stage.status || order.status === 'completed'}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                              order.status === stage.status
                                ? 'ring-2 ring-offset-1 ring-blue-500 ' + stage.color
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {stage.icon} {stage.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View - Table Layout */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Order #</th>
                    <th className="px-6 py-4 text-left font-semibold">Member</th>
                    <th className="px-6 py-4 text-right font-semibold">Total</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 text-gray-700">
                        <div className="flex items-center gap-3">
                          {order.user?.avatar_url ? (
                            <img
                              src={order.user.avatar_url}
                              alt={order.user?.name || 'Member'}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold">
                              {order.user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <span>{order.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">${order.total_price}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 flex-wrap justify-center items-center">
                          <button
                            onClick={() => viewOrderDetails(order.id)}
                            className="px-3 py-1.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all"
                            title="View full order details"
                          >
                            👁️
                          </button>
                          {STAGES.map(stage => (
                            <button
                              key={stage.status}
                              onClick={() => updateOrderStatus(order.id, stage.status)}
                              disabled={order.status === stage.status || order.status === 'completed'}
                              title={`Mark as ${stage.label}`}
                              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                                order.status === stage.status
                                  ? 'ring-2 ring-offset-1 ring-blue-500 ' + stage.color
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {stage.icon}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {orders.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 text-lg">No orders found</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedOrder(null)
        }}
      />
    </div>
  )
}
