import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../services/api'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`)
      setOrder(response.data)
    } catch (err) {
      console.error('Failed to fetch order:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!order) return <div>Order not found</div>

  const orderDate = new Date(order.created_at).toLocaleDateString()
  const updatedDate = new Date(order.updated_at).toLocaleDateString()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
                  <p className="text-gray-600 mt-1">Placed on {orderDate}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {order.notes && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Notes</p>
                  <p className="text-gray-600">{order.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-primary text-white p-4">
                <h2 className="text-xl font-bold">Order Items</h2>
              </div>

              <div className="divide-y">
                {order.orderItems?.map(item => (
                  <div key={item.id} className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.product?.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.unit_price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">${item.unit_price} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 border-t flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary text-2xl">${order.total_price}</span>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-bold text-gray-900 mb-2">Member Information</h3>
                <p className="text-gray-600">{order.user?.name}</p>
                <p className="text-gray-600">{order.user?.phone}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-bold text-gray-900 mb-2">Timeline</h3>
                <p className="text-sm text-gray-600">Order placed: {orderDate}</p>
                <p className="text-sm text-gray-600">Last updated: {updatedDate}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
