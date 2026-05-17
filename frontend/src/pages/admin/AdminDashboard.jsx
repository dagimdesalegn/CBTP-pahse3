import { useEffect, useState } from 'react'
import { BarChart3, Bell, Boxes, ShieldCheck, ShoppingCart, UserCheck, Users } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ActionCard, PageHeader, StatCard } from '../../components/ui'
import { formatBirr } from '../../utils/currency'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

export default function AdminDashboard() {
  const { t } = useLanguage()
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
        eyebrow={t('admin.eyebrow')}
        title={t('admin.dashboard')}
        description={t('admin.dashboardDesc')}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-7">
        <StatCard title={t('nav.orders')} value={stats?.totalOrders} icon={ShoppingCart} tone="sky" />
        <StatCard title={t('reports.revenue')} value={formatBirr(stats?.totalRevenue)} icon={BarChart3} tone="emerald" />
        <StatCard title={t('nav.products')} value={stats?.totalProducts} icon={Boxes} tone="violet" />
        <StatCard title={t('reports.lowStock')} value={stats?.lowStockCount} icon={Boxes} tone="amber" />
        <StatCard title={t('reports.members')} value={stats?.totalMembers} icon={Users} tone="sky" />
        <StatCard title={t('users.verified')} value={stats?.verifiedMembers} icon={UserCheck} tone="emerald" />
        <StatCard title={t('users.pending')} value={stats?.unverifiedMembers} icon={ShieldCheck} tone="rose" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ActionCard title={t('admin.manageUsers')} description={t('admin.manageUsersDesc')} to="/admin/users" icon={Users} tone="dark" />
        <ActionCard title={t('admin.viewReports')} description={t('admin.viewReportsDesc')} to="/admin/reports" icon={BarChart3} tone="amber" />
        <ActionCard title={t('admin.broadcastNotifications')} description={t('admin.broadcastNotificationsDesc')} to="/admin/notifications" icon={Bell} tone="sky" />
      </div>
    </AppLayout>
  )
}
