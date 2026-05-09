import { useEffect, useState } from 'react'
import { CheckCircle2, Eye, PackageCheck, Timer, Truck } from 'lucide-react'
import AppLayout from '../../components/AppLayout'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import Toast from '../../components/Toast'
import OrderDetailModal from '../../components/OrderDetailModal'
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

  const columns = [
    { key: 'id', header: 'Order', render: o => <p className="font-black text-slate-950">#{o.id}</p> },
    {
      key: 'member',
      header: 'Member',
      render: o => (
        <div className="flex items-center gap-3">
          {o.user?.avatar_url ? (
            <img src={o.user.avatar_url} alt={o.user?.name || 'Member'} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{o.user?.name?.charAt(0)?.toUpperCase()}</span>
          )}
          <span className="font-semibold text-slate-800">{o.user?.name || 'Member'}</span>
        </div>
      ),
    },
    { key: 'total', header: 'Total', cellClassName: 'text-right font-black text-slate-950', render: o => formatBirr(o.total_price) },
    { key: 'status', header: 'Status', render: o => <StatusBadge status={o.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: o => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="px-3 py-2" onClick={() => viewOrderDetails(o.id)}><Eye size={15} /></Button>
          {STAGES.map(stage => {
            const Icon = stage.icon
            return (
              <Button
                key={stage.status}
                variant={o.status === stage.status ? 'dark' : 'secondary'}
                className="px-3 py-2"
                onClick={() => updateOrderStatus(o.id, stage.status)}
                disabled={o.status === stage.status || o.status === 'completed'}
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
        eyebrow="Fulfillment"
        title="Order Management"
        description="Review member requests, inspect order contents, and move orders through the pickup workflow."
        actions={
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="ui-input min-w-[190px]">
            {statuses.map(status => <option key={status || 'all'} value={status}>{status ? status.toUpperCase() : 'ALL ORDERS'}</option>)}
          </select>
        }
      />
      <DataTable columns={columns} rows={orders} empty={<EmptyState title="No orders found" description="Orders matching this status will appear here." />} />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <OrderDetailModal order={selectedOrder} isOpen={isDetailModalOpen} onClose={() => { setIsDetailModalOpen(false); setSelectedOrder(null) }} />
    </AppLayout>
  )
}
