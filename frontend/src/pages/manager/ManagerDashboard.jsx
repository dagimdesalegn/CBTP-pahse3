import { useEffect, useState } from 'react'
import { AlertTriangle, ClipboardList, Package, PackageCheck, Settings, ShoppingCart, Store } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ActionCard, PageHeader, StatCard } from '../../components/ui'
import api from '../../services/api'

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products?page=1'),
      ])

      const orders = ordersRes.data.data || []
      const products = productsRes.data.data || []
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        totalProducts: products.length,
        outOfStockProducts: products.filter(p => p.quantity === 0).length,
        lowStockProducts: products.filter(p => p.quantity > 0 && p.quantity <= 10).length,
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
        eyebrow="Operations"
        title="Manager Dashboard"
        description="Monitor store demand, product availability, and fulfillment queues from one operational cockpit."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Orders" value={stats?.totalOrders} icon={ShoppingCart} tone="sky" />
        <StatCard title="Pending" value={stats?.pendingOrders} icon={ClipboardList} tone="amber" />
        <StatCard title="Completed" value={stats?.completedOrders} icon={PackageCheck} tone="emerald" />
        <StatCard title="Products" value={stats?.totalProducts} icon={Store} tone="violet" />
        <StatCard title="Out" value={stats?.outOfStockProducts} icon={AlertTriangle} tone="rose" />
        <StatCard title="Low Stock" value={stats?.lowStockProducts} icon={Package} tone="amber" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ActionCard title="Manage Products" description="Create, update, and remove catalog products." to="/manager/products" icon={Package} tone="dark" />
        <ActionCard title="Process Orders" description="Review member orders and update fulfillment status." to="/manager/orders" icon={ShoppingCart} tone="amber" />
        <ActionCard title="Inventory Control" description="Adjust stock levels and record inventory reasons." to="/manager/inventory" icon={Settings} tone="emerald" />
      </div>
    </AppLayout>
  )
}
