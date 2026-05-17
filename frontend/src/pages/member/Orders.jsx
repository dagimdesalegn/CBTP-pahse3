import { useEffect, useState } from 'react'
import AppLayout from '../../components/AppLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import OrderCard from '../../components/OrderCard'
import { EmptyState, PageHeader } from '../../components/ui'
import api from '../../services/api'
import { useLanguage } from '../../context/LanguageContext'

const filterValues = [
  '',
  'pending',
  'approved',
  'ready',
  'completed',
  'cancelled',
]

export default function Orders() {
  const { t, statusLabel } = useLanguage()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

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
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <PageHeader
        eyebrow={t('orders.center')}
        title={t('orders.mine')}
        description={t('orders.desc')}
      />

      <div className="mb-6 flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
        {filterValues.map(value => (
          <button
            key={value || 'all'}
            onClick={() => setFilter(value)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-bold transition ${
              filter === value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {value ? statusLabel(value) : t('orders.all')}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <EmptyState title={t('orders.noFound')} description={t('orders.noFoundDesc')} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </AppLayout>
  )
}
