import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function MemberDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes, notificationsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products?page=1'),
        api.get('/notifications'),
      ])

      const orders = ordersRes.data.data || ordersRes.data || []
      const products = productsRes.data.data || productsRes.data || []
      const notifications = notificationsRes.data.data || notificationsRes.data || []

      const totalOrders = (Array.isArray(orders) ? orders : []).length
      const totalSpent = (Array.isArray(orders) ? orders : []).reduce(
        (sum, o) => sum + Number(o.total_price || 0),
        0
      )
      const pendingOrders = (Array.isArray(orders) ? orders : []).filter(o => o.status === 'pending').length
      const unreadNotifications = (Array.isArray(notifications) ? notifications : []).filter(n => !n.is_read).length
      const availableProducts = (Array.isArray(products) ? products : []).length

      setStats({
        totalOrders,
        totalSpent,
        pendingOrders,
        unreadNotifications,
        availableProducts,
      })
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setStats({
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        unreadNotifications: 0,
        availableProducts: 0,
      })
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome, {user?.name}!</h1>

            {!user?.is_verified && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg mb-8">
                <p>⚠️ Your account is pending verification. You cannot place orders yet.</p>
                <p className="text-sm mt-1">
                  {user?.verification_submitted_at
                    ? 'Verification submitted. Please wait for approval.'
                    : 'Submit your kebele ID, coupon ID, and ID image from your profile.'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard title="Total Orders" value={stats?.totalOrders || 0} color="blue" />
              <StatCard title="Total Spent" value={`$${Number(stats?.totalSpent || 0).toFixed(2)}`} color="green" />
              <StatCard title="Pending Orders" value={stats?.pendingOrders || 0} color="yellow" />
              <StatCard title="Available Products" value={stats?.availableProducts || 0} color="purple" />
              <StatCard title="Unread Notifications" value={stats?.unreadNotifications || 0} color="red" />
            </div>

            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ActionCard
                title="Browse Products"
                description="View available products and place orders"
                link="/member/products"
                color="blue"
              />
              <ActionCard
                title="View Orders"
                description="Check your order history and status"
                link="/member/orders"
                color="green"
              />
              <ActionCard
                title="My Profile"
                description="View and update your profile information"
                link="/profile"
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
  }

  return (
    <div className={`${colorStyles[color]} border rounded-lg p-6`}>
      <p className="text-gray-600 text-sm mb-2">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
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
      className={`${colorStyles[color]} text-white rounded-lg p-6 transition-colors cursor-pointer`}
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-opacity-90">{description}</p>
    </a>
  )
}
