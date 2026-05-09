import { useEffect, useState } from 'react'
import { CheckCircle2, PackageCheck, Timer, Truck } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import StatusBadge from '../../components/StatusBadge'
import { Button, DataTable, EmptyState, PageHeader } from '../../components/ui'
import { formatBirr } from '../../utils/currency'
import api from '../../services/api'

const STAGES = [
  { status: 'pending', label: 'Requested', icon: Timer },
  { status: 'approved', label: 'Approved', icon: CheckCircle2 },
  { status: 'ready', label: 'Ready', icon: PackageCheck },
  { status: 'completed', label: 'Completed', icon: Truck },
]

const statuses = ['', 'pending', 'approved', 'ready', 'completed', 'cancelled']

export default function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter) params.append('status', filter)
      params.append('per_page', '100')
      const response = await api.get(`/orders?${params}`)
      setOrders(response.data.data || [])
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to fetch orders' })
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      setToast({ type: 'success', message: `Order status updated to ${newStatus}` })
      fetchOrders()
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update order' })
    }
  }

  if (loading) return <LoadingSpinner />

  const columns = [
    { key: 'id', header: 'Order', render: order => <p className="font-black text-slate-950">#{order.id}</p> },
    { key: 'member', header: 'Member', render: order => <p className="font-semibold text-slate-800">{order.user?.name || 'Member'}</p> },
    { key: 'items', header: 'Items', cellClassName: 'text-center font-bold', render: order => order.orderItems?.length || order.order_items?.length || 0 },
    { key: 'total', header: 'Total', cellClassName: 'text-right font-black text-slate-950', render: order => formatBirr(order.total_price) },
    { key: 'status', header: 'Status', render: order => <StatusBadge status={order.status} /> },
    {
      key: 'actions',
      header: 'Change Status',
      render: order => (
        <div className="flex flex-wrap gap-2">
          {STAGES.map(stage => {
            const Icon = stage.icon
            return (
              <Button
                key={stage.status}
                variant={order.status === stage.status ? 'dark' : 'secondary'}
                className="px-3 py-2"
                onClick={() => updateStatus(order.id, stage.status)}
                disabled={order.status === stage.status || order.status === 'completed'}
                title={`Mark as ${stage.label}`}
              >
                <Icon size={15} />
              </Button>
            )
          })}
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Administration"
        title="All Orders"
        description="Review every member order and update fulfillment state when needed."
        actions={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="ui-input min-w-[190px]">
            {statuses.map(status => <option key={status || 'all'} value={status}>{status ? status.toUpperCase() : 'ALL ORDERS'}</option>)}
          </select>
        }
      />
      <DataTable columns={columns} rows={orders} empty={<EmptyState title="No orders found" description="Orders matching this status will appear here." />} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
