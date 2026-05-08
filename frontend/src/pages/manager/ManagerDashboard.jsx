import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../services/api'

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes, inventoryRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products?page=1'),
        api.get('/inventory/logs?limit=10'),
      ])

      const orders = ordersRes.data.data || []
      const products = productsRes.data.data || []

      const totalOrders = orders.length
      const pendingOrders = orders.filter(o => o.status === 'pending').length
      const completedOrders = orders.filter(o => o.status === 'completed').length
      const outOfStockProducts = products.filter(p => p.quantity === 0).length
      const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= 10).length

      setStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        totalProducts: products.length,
        outOfStockProducts,
        lowStockProducts,
      })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
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
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Manager Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <StatCard title="Total Orders" value={stats?.totalOrders} color="blue" />
              <StatCard title="Pending Orders" value={stats?.pendingOrders} color="yellow" />
              <StatCard title="Completed Orders" value={stats?.completedOrders} color="green" />
              <StatCard title="Total Products" value={stats?.totalProducts} color="purple" />
              <StatCard title="Out of Stock" value={stats?.outOfStockProducts} color="red" />
              <StatCard title="Low Stock" value={stats?.lowStockProducts} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ActionCard
                title="Manage Products"
                description="Add, edit, or delete products"
                link="/manager/products"
                color="blue"
              />
              <ActionCard
                title="Manage Orders"
                description="Review and process member orders"
                link="/manager/orders"
                color="green"
              />
              <ActionCard
                title="Inventory Management"
                description="Update stock levels and view logs"
                link="/manager/inventory"
                color="purple"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }) {
  const colorStyles = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
  }

  return (
    <div className={`${colorStyles[color]} border rounded-lg p-4`}>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function ActionCard({ title, description, link, color }) {
  const colorStyles = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  }

  return (
    <a
      href={link}
      className={`${colorStyles[color]} text-white rounded-lg p-6 transition-colors`}
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-opacity-90">{description}</p>
    </a>
  )
}
