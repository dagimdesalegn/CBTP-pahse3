import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../services/api'

export default function Reports() {
  const [activeTab, setActiveTab] = useState('inventory')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [activeTab])

  const fetchReport = async () => {
    setLoading(true)
    try {
      let response
      if (activeTab === 'inventory') {
        response = await api.get('/reports/inventory')
      } else if (activeTab === 'orders') {
        response = await api.get('/reports/orders')
      } else if (activeTab === 'members') {
        response = await api.get('/reports/members')
      }
      setReportData(response.data)
    } catch (err) {
      console.error('Failed to fetch report:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports</h1>

            <div className="flex gap-4 mb-8">
              {['inventory', 'orders', 'members'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'inventory' && (
              <InventoryReport data={reportData} />
            )}

            {activeTab === 'orders' && (
              <OrdersReport data={reportData} />
            )}

            {activeTab === 'members' && (
              <MembersReport data={reportData} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function InventoryReport({ data }) {
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={data.total_products} />
        <StatCard title="Stock Value" value={`$${(data.total_stock_value || 0).toFixed(2)}`} />
        <StatCard title="Low Stock Items" value={data.low_stock_count} color="yellow" />
        <StatCard title="Out of Stock" value={data.out_of_stock_count} color="red" />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">All Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Stock</th>
                <th className="px-4 py-2 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.products?.map(product => (
                <tr key={product.id} className="border-b">
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.category}</td>
                  <td className="px-4 py-2 text-right">${product.price}</td>
                  <td className="px-4 py-2 text-right">{product.quantity}</td>
                  <td className="px-4 py-2 text-right">${(product.price * product.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function OrdersReport({ data }) {
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={data.total_orders} />
        <StatCard title="Total Revenue" value={`$${(data.total_revenue || 0).toFixed(2)}`} color="green" />
        <StatCard title="Avg Order Value" value={`$${(data.avg_order_value || 0).toFixed(2)}`} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Orders by Status</h2>
        <div className="space-y-2">
          {Object.entries(data.status_breakdown || {}).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center">
              <span className="capitalize font-medium">{status}</span>
              <span className="text-lg font-bold text-primary">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MembersReport({ data }) {
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Members" value={data.total_members} />
        <StatCard title="Verified" value={data.verified_members} color="green" />
        <StatCard title="Unverified" value={data.unverified_members} color="yellow" />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Top Members by Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-center">Orders</th>
                <th className="px-4 py-2 text-right">Total Spent</th>
                <th className="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.member_activity?.slice(0, 10).map(member => (
                <tr key={member.id} className="border-b">
                  <td className="px-4 py-2">{member.name}</td>
                  <td className="px-4 py-2">{member.phone}</td>
                  <td className="px-4 py-2 text-center">{member.orders_count}</td>
                  <td className="px-4 py-2 text-right">${member.total_orders_value.toFixed(2)}</td>
                  <td className="px-4 py-2 text-center">
                    {member.is_verified ? '✓ Verified' : '⦿ Unverified'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }) {
  const colorStyles = {
    default: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
  }

  return (
    <div className={`${colorStyles[color] || colorStyles.default} border rounded-lg p-4`}>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
