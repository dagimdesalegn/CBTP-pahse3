import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        api.get('/reports/orders'),
        api.get('/reports/inventory'),
        api.get('/reports/members'),
      ])

      setStats({
        totalOrders: ordersRes.data.total_orders,
        totalRevenue: ordersRes.data.total_revenue,
        totalProducts: productsRes.data.total_products,
        lowStockCount: productsRes.data.low_stock_count,
        totalMembers: usersRes.data.total_members,
        verifiedMembers: usersRes.data.verified_members,
        unverifiedMembers: usersRes.data.unverified_members,
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
              <StatCard title="Total Orders" value={stats?.totalOrders} color="blue" />
              <StatCard title="Total Revenue" value={`$${(stats?.totalRevenue || 0).toFixed(2)}`} color="green" />
              <StatCard title="Total Products" value={stats?.totalProducts} color="purple" />
              <StatCard title="Low Stock Items" value={stats?.lowStockCount} color="yellow" />
              <StatCard title="Total Members" value={stats?.totalMembers} color="blue" />
              <StatCard title="Verified" value={stats?.verifiedMembers} color="green" />
              <StatCard title="Unverified" value={stats?.unverifiedMembers} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <ActionCard
                title="Manage Users"
                description="Verify members, manage accounts"
                link="/admin/users"
                color="blue"
              />
              <ActionCard
                title="View Reports"
                description="Inventory, orders, and member reports"
                link="/admin/reports"
                color="green"
              />
              <ActionCard
                title="Send Notifications"
                description="Broadcast messages to members"
                link="/admin/notifications"
                color="yellow"
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
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
  }

  return (
    <a
      href={link}
      className={`${colorStyles[color]} text-white rounded-lg p-6 transition-colors`}
    >
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-opacity-90">{description}</p>
    </a>
  )
}
