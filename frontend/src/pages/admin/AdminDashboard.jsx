import { useEffect, useState } from 'react'
import { BarChart3, Bell, Boxes, ShieldCheck, ShoppingCart, UserCheck, Users } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ActionCard, PageHeader, StatCard } from '../../components/ui'
import { formatBirr } from '../../utils/currency'
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
    <AppLayout>
      <PageHeader
        eyebrow="Administration"
        title="Admin Dashboard"
        description="High-level store performance, member verification, inventory risk, and broadcast controls."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-7">
        <StatCard title="Orders" value={stats?.totalOrders} icon={ShoppingCart} tone="sky" />
        <StatCard title="Revenue" value={formatBirr(stats?.totalRevenue)} icon={BarChart3} tone="emerald" />
        <StatCard title="Products" value={stats?.totalProducts} icon={Boxes} tone="violet" />
        <StatCard title="Low Stock" value={stats?.lowStockCount} icon={Boxes} tone="amber" />
        <StatCard title="Members" value={stats?.totalMembers} icon={Users} tone="sky" />
        <StatCard title="Verified" value={stats?.verifiedMembers} icon={UserCheck} tone="emerald" />
        <StatCard title="Pending" value={stats?.unverifiedMembers} icon={ShieldCheck} tone="rose" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ActionCard title="Manage Users" description="Verify members and review account details." to="/admin/users" icon={Users} tone="dark" />
        <ActionCard title="View Reports" description="Analyze inventory, orders, revenue, and member activity." to="/admin/reports" icon={BarChart3} tone="amber" />
        <ActionCard title="Broadcast Notifications" description="Send clear operational updates to members." to="/admin/notifications" icon={Bell} tone="sky" />
      </div>
    </AppLayout>
  )
}
